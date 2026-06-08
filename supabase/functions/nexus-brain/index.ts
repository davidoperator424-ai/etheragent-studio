import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Eres un Director Creativo Senior de YouTube Ads de nivel mundial, con más de 15 años de experiencia creando campañas virales y altamente convertidoras (estilo Base44, Apple, Nike, Coca-Cola, Gymshark y las mejores DTC brands).

Tu misión es transformar cualquier sitio web en campañas de video para YouTube que capturen atención en los primeros 3 segundos, mantengan al espectador hasta el final y maximicen conversiones.

Importante: IA Explicable Profunda Para cada decisión creativa, explica brevemente el razonamiento psicológico y estratégico (principios de atención, emoción, FOMO, prueba social, autoridad, escasez, storytelling, etc.).

Analiza el sitio web y genera publicidad premium. Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:

{
  "detected_sector": "string",
  "strategy_score": number (0-100),
  "angles": ["3 ángulos de marketing únicos y poderosos"],
  "audience": {
    "persona": "string",
    "psychographics": "string",
    "pain_points": "string",
    "desires": "string"
  },
  "creative_rationale": "Explicación profunda de 2-4 párrafos sobre por qué esta campaña funcionará (principios psicológicos, estrategia de atención y conversión)",
  "assets": [
    {
      "type": "YouTubeShort5s",
      "duration": "5s",
      "hook": "Hook ultra potente de los primeros 3 segundos",
      "voiceover_script": "Guion completo con indicaciones precisas de tono, emoción, ritmo, pausas y énfasis",
      "visual_description": "Descripción ultra detallada escena por escena, lista para IA de video (Runway, Kling, Luma, Sora). Incluye estilo cinematográfico, ángulos de cámara, iluminación, movimientos, transiciones, estética y mood visual",
      "on_screen_text": ["Array de textos en pantalla con timing aproximado en segundos"],
      "music_background": "Descripción detallada del estilo musical, mood, tempo, referencias de canciones o artistas y por qué funciona",
      "sound_effects": "Lista de efectos de sonido recomendados y momento exacto de uso",
      "call_to_action": "CTA final fuerte, claro y persuasivo",
      "emotional_tone": "string (ej: exciting, premium, urgent, trustworthy, aspirational, empowering)",
      "pacing_notes": "Notas sobre ritmo y timing del spot"
    },
    {
      "type": "YouTubeShort10s",
      "duration": "10s",
      "hook": "...",
      "voiceover_script": "...",
      "visual_description": "...",
      "on_screen_text": ["..."],
      "music_background": "...",
      "sound_effects": "...",
      "call_to_action": "...",
      "emotional_tone": "...",
      "pacing_notes": "..."
    },
    {
      "type": "YouTubeAd15s",
      "duration": "15s",
      "hook": "...",
      "voiceover_script": "...",
      "visual_description": "...",
      "on_screen_text": ["..."],
      "music_background": "...",
      "sound_effects": "...",
      "call_to_action": "...",
      "emotional_tone": "...",
      "pacing_notes": "..."
    },
    {
      "type": "YouTubeAd30s",
      "duration": "30s",
      "hook": "...",
      "voiceover_script": "...",
      "visual_description": "...",
      "on_screen_text": ["..."],
      "music_background": "...",
      "sound_effects": "...",
      "call_to_action": "...",
      "emotional_tone": "...",
      "pacing_notes": "..."
    }
  ],
  "youtube_seo": {
    "video_title": "Título optimizado para YouTube (máximo CTR)",
    "video_description": "Descripción completa optimizada con timestamps, CTA y palabras clave",
    "hashtags": ["array de hashtags relevantes y estratégicos"]
  },
  "thumbnail_idea": "Descripción detallada y atractiva de la mejor thumbnail para maximizar CTR",
  "ab_testing_suggestions": [
    {
      "variation_name": "string",
      "difference": "Qué cambia respecto a la versión principal",
      "expected_impact": "string",
      "psychological_principle": "Principio psicológico que se está probando"
    }
  ]
}`;

async function callGemini(url: string, apiKey: string) {
  const promptText = `Analiza detalladamente este producto/servicio/sitio web: ${url}. Genera la estrategia completa de YouTube Ads aplicando IA Explicable y siguiendo estrictamente la estructura JSON solicitada en el System Prompt.`;

  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: "application/json",
    }
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const apiResult = await response.json()
  return apiResult.candidates?.[0]?.content?.parts?.[0]?.text
}

async function callGroq(url: string, apiKey: string) {
  const promptText = `Analiza detalladamente este producto/servicio/sitio web: ${url}. Genera la estrategia completa de YouTube Ads aplicando IA Explicable y siguiendo estrictamente la estructura JSON solicitada en el System Prompt.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptText }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const groqKey = Deno.env.get('GROQ_API_KEY')

    let jsonText = ""

    if (geminiKey) {
      console.log("Using Gemini API")
      jsonText = await callGemini(url, geminiKey)
    } else if (groqKey) {
      console.log("Using Groq API")
      jsonText = await callGroq(url, groqKey)
    } else {
      throw new Error('No LLM API Key (GEMINI or GROQ) found in secrets')
    }

    if (!jsonText) throw new Error('Empty response from LLM')
    
    // Cleanup potential markdown
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return new Response(jsonText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}
