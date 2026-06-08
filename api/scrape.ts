import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const config = { runtime: 'edge' };

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

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceKey);
}

async function callGroq(scrapeData: any, apiKey: string) {
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
        { role: 'user', content: `Scrape Data: ${JSON.stringify(scrapeData)}` }
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
  return JSON.parse(data.choices[0].message.content);
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { url, userId } = await req.json();

    if (!url || !userId) {
      return new Response(
        JSON.stringify({ error: 'URL and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseAdmin();
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!firecrawlKey) throw new Error('Missing FIRECRAWL_API_KEY env var');
    if (!groqKey) throw new Error('Missing GROQ_API_KEY env var');

    // 1. Crear campaña inicial
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        owner_id: userId,
        title: `Campaña: ${new URL(url).hostname}`,
        source_url: url,
        status: 'draft',
        scraping_status: 'scraping',
        brand_context: {}
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    console.log(`Scraping ${url}...`);

    // 2. Scrape with Firecrawl (sync)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, formats: ['markdown'] }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      await supabase.from('campaigns').update({ scraping_status: 'failed' }).eq('id', campaign.id);
      return new Response(
        JSON.stringify({ error: 'Scraping failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: scrapeResult } = await firecrawlResponse.json();
    const markdown = scrapeResult?.markdown || '';

    if (!markdown) {
      await supabase.from('campaigns').update({ scraping_status: 'failed' }).eq('id', campaign.id);
      return new Response(
        JSON.stringify({ error: 'No content scraped from URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Analyze with Groq (Marcus)
    console.log(`Analyzing content (${markdown.length} chars) with Groq...`);
    const analysis = await callGroq({ markdown, url }, groqKey);

    // 4. Update campaign with results
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        brand_context: analysis.brand_context,
        metrics: { escenas: analysis.escenas },
        scraping_status: 'completed',
        status: 'deployed'
      })
      .eq('id', campaign.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, campaignId: campaign.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
