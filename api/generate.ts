import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const runtime = 'nodejs';

const DEPLOYMENT_COST = 15;
const MASTER_AVATAR_PROMPT = `You are creating a premium B2B professional avatar for a high-value digital product/service. 

Generate a photorealistic executive portrait with these requirements:
- Professional business attire (suit or smart business casual)
- Confident, approachable expression
- Modern corporate setting or clean gradient background
- High-end professional lighting
- Face clearly visible, head and shoulders composition
- Suitable for a SaaS founder, executive, or influencer marketing
- Style: premium, trustworthy, sophisticated

The niche/context is: `;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceKey);
}

async function getUserTokenBalance(supabase: any, userId: string): Promise<number> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('compute_tokens')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      return 999999;
    }
    return profile.compute_tokens || 0;
  } catch (e) {
    return 999999;
  }
}

async function deductTokens(supabase: any, userId: string, amount: number): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('deduct_compute_tokens', { 
      user_id: userId, 
      amount: amount 
    });
    return !error;
  } catch (e) {
    return false;
  }
}

async function generateVisual(prompt: string, aspectRatio: string): Promise<string> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) return '';

  const sizeMap: Record<string, { width: number; height: number }> = {
    '9:16': { width: 1080, height: 1920 },
    '16:9': { width: 1920, height: 1080 },
    '1:1': { width: 1080, height: 1080 },
    '4:5': { width: 1080, height: 1350 },
  };

  const size = sizeMap[aspectRatio] || sizeMap['9:16'];

  const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      image_size: size,
      num_inference_steps: 30,
    }),
  });

  if (!response.ok) throw new Error('Failed to generate visual');

  const result = await response.json();
  return result.images?.[0]?.url || '';
}

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || (request.url.includes('/avatar') ? 'avatar' : (request.url.includes('/campaign') ? 'campaign' : 'blueprint'));

  try {
    if (type === 'avatar') {
      const { prompt } = await request.json();
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error('Missing Google API Key');

      const ai = new GoogleGenAI({ apiKey });
      const model = 'imagen-3.0-generate-002';
      const result = await (ai as any).models.generateImages({
        model,
        prompt: `${MASTER_AVATAR_PROMPT}${prompt}`,
      });

      const image = result.generatedImages?.[0];
      if (!image?.image) throw new Error('Failed to generate image');

      return new Response(
        JSON.stringify({
          imageUrl: `data:image/png;base64,${image.image.imageBytes}`,
          seed: image.generationMetadata?.seed || Math.floor(Math.random() * 1000000),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'campaign') {
      const { prompt, userId } = await request.json();
      if (!prompt || !userId) throw new Error('Missing prompt or userId');

      const supabase = getSupabaseAdmin();
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const { data: profile } = await supabase
        .from('profiles')
        .select('compute_tokens, plan_name')
        .eq('id', userId)
        .maybeSingle();

      const hasFreeTrial = !profile || profile.plan_name === 'free' || profile.compute_tokens > 0;
      if (!hasFreeTrial) {
        return new Response(JSON.stringify({ error: 'Prueba gratuita agotada', code: 'TRIAL_EXHAUSTED' }), { status: 403, headers: corsHeaders });
      }

      const groqSystemPrompt = `Eres el Director Creativo de EtherAgent OS. Genera UNA respuesta JSON válida con esta estructura exacta para videos nativos:
{
  "mission_id": "Un ID único alfanumérico",
  "hook": "Un gancho narrativo de 3 segundos",
  "narrative_body": "Cuerpo persuasivo enfocado en resultados",
  "on_screen_text": ["TEXTO 1", "TEXTO 2", "TEXTO 3"],
  "call_to_action": "Instrucción final",
  "visual_description": "Prompt detallado en inglés para generar o elegir el asset visual"
}
Responde SOLO con JSON válido.`;

      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: 'system', content: groqSystemPrompt }, { role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
      });

      let strategy = JSON.parse(groqResponse.choices[0]?.message?.content || '{}');
      
      if (profile && profile.compute_tokens > 0) {
        await supabase.from('profiles').update({ compute_tokens: profile.compute_tokens - 1 }).eq('id', userId);
      }

      return new Response(JSON.stringify(strategy), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      // Blueprint Logic
      const authHeader = request.headers.get('Authorization');
      const supabase = getSupabaseAdmin();
      let userId = 'anonymous';
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || 'anonymous';
      }

      const blueprint = await request.json();
      const { missionId, brand, archetype, script, visualPrompt, aspectRatio, voiceStyle } = blueprint;

      const visualUrl = await generateVisual(visualPrompt || `${brand} marketing`, aspectRatio || '9:16').catch(() => '');

      if (userId !== 'anonymous' && visualUrl) {
        await deductTokens(supabase, userId, DEPLOYMENT_COST);
      }

      const { data: campaign } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId,
          name: missionId,
          brand,
          archetype,
          status: 'completed',
          metadata: { script, visualPrompt, aspectRatio, voiceStyle },
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          missionId,
          assets: { audio: null, visual: visualUrl || null, script },
          campaignId: campaign?.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Generation failed', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
