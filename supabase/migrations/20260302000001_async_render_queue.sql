-- Async Render Queue Migration
-- Adds queue functionality for background video processing

-- Install pgmq extension ( Supabase's message queue)
CREATE EXTENSION IF NOT EXISTS "pgmq";

-- Create the render queue
SELECT pgmq.create_queue('render_queue', 100, true);

-- Function to process render job
CREATE OR REPLACE FUNCTION process_render_job(job_data JSONB)
RETURNS VOID AS $$
DECLARE
  v_job_id UUID;
  v_avatar_id UUID;
  v_script TEXT;
  v_platform TEXT;
  v_voice_id TEXT;
  v_background_prompt TEXT;
  v_user_id UUID;
  v_audio_url TEXT;
  v_video_url TEXT;
  v_final_url TEXT;
BEGIN
  -- Extract job data
  v_job_id := (job_data->>'jobId')::UUID;
  v_avatar_id := (job_data->>'avatarId')::UUID;
  v_script := job_data->>'script';
  v_platform := job_data->>'platform';
  v_voice_id := job_data->>'voiceId';
  v_background_prompt := job_data->>'backgroundPrompt';
  v_user_id := (job_data->>'userId')::UUID;

  -- Update job status to processing
  UPDATE render_jobs 
  SET status = 'processing', metadata = jsonb_build('started_at', NOW())
  WHERE id = v_job_id;

  -- Step 1: Initialize video asset logic
  BEGIN
    v_audio_url := NULL;
    -- Audio generation would happen here via external API call
    -- For now, we'll mark it as generated
  EXCEPTION WHEN OTHERS THEN
    UPDATE render_jobs SET status = 'failed', metadata = jsonb_build('error', SQLERRM)
    WHERE id = v_job_id;
    RETURN;
  END;

  -- Step 2: Generate background with Fal.ai (optional)
  IF v_background_prompt IS NOT NULL THEN
    BEGIN
      -- Background generation would happen here
      NULL;
    EXCEPTION WHEN OTHERS THEN
      -- Continue without background if it fails
    END;
  END IF;

  -- Step 3: Create lip sync with SyncLabs (if we have both video and audio)
  IF v_audio_url IS NOT NULL THEN
    BEGIN
      -- Lip sync would happen here
      NULL;
    EXCEPTION WHEN OTHERS THEN
      -- Continue without lip sync if it fails
    END;
  END IF;

  -- Update job as completed
  UPDATE render_jobs 
  SET status = 'completed', 
      video_url = v_final_url,
      completed_at = NOW(),
      metadata = jsonb_build('completed_at', NOW())
  WHERE id = v_job_id;

  -- Trigger notification (would integrate with webhooks/pusher)
  -- For now, the frontend can poll the status

EXCEPTION WHEN OTHERS THEN
  UPDATE render_jobs SET status = 'failed', metadata = jsonb_build('error', SQLERRM)
  WHERE id = v_job_id;
  RAISE;
END;
$$ LANGUAGE plpgsql;

-- Function to be called by cron/worker to process scheduled content
CREATE OR REPLACE FUNCTION process_scheduled_content()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_schedule RECORD;
  v_agent RECORD;
  v_content TEXT;
  v_platform TEXT;
  v_job_id UUID;
BEGIN
  -- Find active schedules that are due
  FOR v_schedule IN 
    SELECT s.*, a.system_prompt, a.name, a.niche, a.tone
    FROM agent_schedules s
    JOIN agent_personas a ON s.agent_id = a.id
    WHERE s.is_active = true
    AND (s.next_run_at IS NULL OR s.next_run_at <= NOW())
    AND (
      s.last_run_at IS NULL 
      OR DATE_TRUNC('day', s.last_run_at) < DATE_TRUNC('day', NOW())
    )
    LIMIT 10
  LOOP
    -- Generate content using the agent's prompt
    -- This would call the Gemini API to generate content
    
    -- Create content record
    INSERT INTO agent_content (
      agent_id,
      content_type,
      generated_text,
      platform,
      status
    ) VALUES (
      v_schedule.agent_id,
      'text',
      v_schedule.content_prompt,
      (v_schedule.platforms)[1],
      'pending_approval'
    );

    -- Update schedule
    UPDATE agent_schedules
    SET last_run_at = NOW(),
        next_run_at = NOW() + (v_schedule.post_frequency_hours || ' hours')::INTERVAL
    WHERE id = v_schedule.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
