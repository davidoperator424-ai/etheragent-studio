import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceKey);
}

async function processRenderJobAsync(jobId: string, params: {
  avatarId: string;
  script: string;
  platform?: string;
  voiceId?: string;
  backgroundPrompt?: string;
  avatarHqUrl?: string;
}) {
  const supabase = getSupabaseAdmin();
  
  try {
    await supabase
      .from('render_jobs')
      .update({ status: 'processing', metadata: { startedAt: new Date().toISOString() } })
      .eq('id', jobId);

    let videoUrl: string | null = params.avatarHqUrl || null;

    // In V2, we assume the video asset already has integrated audio or we use native video.
    // Audio generation and lip-sync are deprecated.

    await supabase
      .from('render_jobs')
      .update({ 
        status: 'completed', 
        video_url: videoUrl,
        completed_at: new Date().toISOString(),
        metadata: { 
          completedAt: new Date().toISOString(),
          nativeVideo: true
        }
      })
      .eq('id', jobId);

  } catch (error) {
    await supabase
      .from('render_jobs')
      .update({ 
        status: 'failed',
        metadata: { error: String(error) }
      })
      .eq('id', jobId);
    throw error;
  }
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseAdmin();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const url = new URL(request.url);
    const isAsync = body.async === true || url.searchParams.get('async') === 'true';
    const { avatarId, script, platform, voiceId, backgroundPrompt } = body;

    if (!avatarId || !script) {
      return new Response(
        JSON.stringify({ error: 'Avatar ID and script are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: avatar, error: avatarError } = await supabase
      .from('avatars')
      .select('id, name, avatar_hq_url, image_url')
      .eq('id', avatarId)
      .single();

    if (avatarError || !avatar) {
      return new Response(
        JSON.stringify({ error: 'Avatar not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isAsync) {
      const { data: renderJob, error: insertError } = await supabase
        .from('render_jobs')
        .insert({
          user_id: user.id,
          avatar_id: avatarId,
          script,
          platform,
          status: 'queued',
          metadata: { 
            voiceId, 
            backgroundPrompt,
            queuedAt: new Date().toISOString(),
            estimatedTimeMinutes: 5 // Reduced as we no longer do complex processing
          },
        })
        .select()
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create render job' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      setImmediate(async () => {
        try {
          await processRenderJobAsync(renderJob.id, {
            avatarId,
            script,
            platform,
            voiceId,
            backgroundPrompt,
            avatarHqUrl: avatar.avatar_hq_url || avatar.image_url,
          });
        } catch (error) {
          console.error('Background render processing failed:', error);
        }
      });

      return new Response(
        JSON.stringify({ 
          jobId: renderJob.id,
          status: 'queued',
          estimatedTimeMinutes: 5,
          message: 'Render job has been queued.'
        }),
        { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Synchronous render
      const { data: renderJob, error: insertError } = await supabase
        .from('render_jobs')
        .insert({
          user_id: user.id,
          avatar_id: avatarId,
          script,
          platform,
          status: 'completed',
          metadata: { voiceId, backgroundPrompt },
          video_url: avatar.avatar_hq_url || avatar.image_url,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create render job' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          renderId: renderJob.id, 
          videoUrl: avatar.avatar_hq_url || avatar.image_url,
          status: 'completed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Render request error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process render request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
