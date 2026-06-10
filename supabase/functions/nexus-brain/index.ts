// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

const SYSTEM_PROMPT = `Eres un Director Creativo Senior B2B especializado en narrativa de video nativo para YouTube Ads, TikTok e Instagram Reels. Tienes 15+ años generando campañas de alto ROI para marcas como Salesforce, HubSpot, Stripe, Notion y Figma.

Tu misión: transformar cualquier sitio web o producto en una campaña de video B2B estructurada con un gancho magnético, un cuerpo narrativo persuasivo y una dirección visual precisa para generación por IA (Runway, Kling, Luma, Sora).

═══ REGLAS ABSOLUTAS ═══

1. El hook debe ser un pattern interrupt de 1-2 líneas que detenga el scroll en los primeros 3 segundos.
2. narrative_body: 2-3 párrafos persuasivos enfocados en ROI, dolor del cliente, prueba social y urgencia.
3. visual_description: prompt detallado EN INGLÉS para generar video por IA. Especifica iluminación, encuadre, estilo cinemático, textura, color grading, lente, movimiento de cámara. Sin marcas de tiempo ni estructura HOOK/DESARROLLO/OUTRO.
4. on_screen_text: 2-4 textos cortos de alto impacto que aparecerán como overlays sobre el video (estilo Shorts/Reels).
5. call_to_action: instrucción clara y urgente.

═══ JSON A DEVOLVER (ÚNICAMENTE ESTO, SIN MARKDOWN, SIN COMENTARIOS) ═══

{
  "detected_sector": "string (sector industrial detectado: SaaS | Fintech | E-commerce | Web3 | Health | Education | Enterprise)",
  "strategy_score": integer (0-100, basado en potencial de viralización y conversión),
  "angles": ["3 ángulos de marketing únicos con enfoque psicológico B2B"],
  "mission_id": "string (formato: EA-[SECTOR]-[XXX] donde XXX son 3 dígitos aleatorios)",
  "hook": "string (gancho de 1-2 líneas que rompe el scroll, tono B2B ejecutivo)",
  "narrative_body": "string (2-3 párrafos persuasivos: dolor → agitación → solución → ROI → prueba social → urgencia)",
  "on_screen_text": ["TEXTO 1", "TEXTO 2", "TEXTO 3"],
  "call_to_action": "string (CTA con urgencia B2B: Demo | Whitepaper | Consultoría | Trial)",
  "visual_description": "string (prompt detallado en inglés para generación de video por IA: especifica iluminación, encuadre, lente, movimiento, textura, color grading, estilo. Sin marcas de tiempo. Mínimo 100 caracteres.)"
}`;

async function callGemini(url: string, apiKey: string) {
  const promptText = `Analiza este sitio web/producto/servicio B2B: ${url}. Genera una estrategia de video nativo con gancho magnético, narrativa persuasiva y dirección visual para IA. Sigue estrictamente la estructura JSON del System Prompt.`;

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
  const promptText = `Analiza en profundidad este sitio B2B: ${url}. Genera una campaña de video nativo con gancho B2B, cuerpo narrativo persuasivo enfocado en ROI, y un prompt visual detallado en inglés para generación por IA. Sigue estrictamente la estructura JSON del System Prompt.`;

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
      temperature: 0.7,
      max_tokens: 4096,
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url) {
      throw new Error('Target URL is required');
    }

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
    
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return new Response(jsonText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Edge Function error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
