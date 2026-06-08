import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres Marcus, el Director de Estrategia B2B de EtherAgent OS.
Se te entregará el contenido en crudo (Scrape Data) extraído de la URL objetivo del cliente.
TU MISIÓN:
1. Extrae el Tono de Marca (Brand Voice).
2. Identifica el Pain Point principal de su audiencia.
3. Define la Oferta de Valor central.
4. Genera una campaña comercial estrictamente SOBRIA, PREMIUM y de ALTO IMPACTO orientada a conversión (LTV, CAC).
PROHIBIDO: Usar lenguaje infantil, metáforas mágicas o exceso de emojis. Eres un ejecutivo de élite.

Retorna SOLO un JSON válido:
{
  "brand_context": { "tone": "...", "pain_point": "...", "value_prop": "..." },
  "escenas": [ { "id": 1, "prompt_imagen": "...", "copy": "..." } ]
}`;

async function callGroq(scrapeData: any, apiKey: string) {
  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Scrape Data: ${JSON.stringify(scrapeData)}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
  });

  if (!groqResponse.ok) {
    const error = await groqResponse.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await groqResponse.json();
  return JSON.parse(data.choices[0].message.content);
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqKey = Deno.env.get('GROQ_API_KEY')!;

    const supabase = createClient(supabaseUrl, serviceKey);
    
    // El payload puede variar dependiendo de si viene de Apify o Firecrawl
    const body = await req.json();
    
    // Asumimos que pasamos el campaignId en los metadatos o query params
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaignId');

    if (!campaignId) {
      throw new Error('Missing campaignId in webhook URL');
    }

    console.log(`Processing scrape webhook for campaign: ${campaignId}`);

    // 1. Analizar con Marcus (Groq)
    const analysis = await callGroq(body, groqKey);

    // 2. Actualizar Supabase
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        brand_context: analysis.brand_context,
        metadata: analysis.escenas, // Mapeamos escenas a metadata para compatibilidad con el sistema actual
        scraping_status: 'completed',
        status: 'completed'
      })
      .eq('id', campaignId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
