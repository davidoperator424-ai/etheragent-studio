import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceKey);
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

    // 1. Crear campaña inicial
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        owner_id: userId,
        title: `Campaña: ${new URL(url).hostname}`,
        source_url: url,
        status: 'pending',
        scraping_status: 'scraping',
        brand_context: {}
      })
      .select()
      .single();

    if (campaignError) throw campaignError;

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) throw new Error('Missing Firecrawl API Key');

    // 2. Disparar Firecrawl Batch Scrape (Async with Webhook)
    // El webhook apunta a la Supabase Edge Function que creamos
    const webhookUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/webhook-scrape?campaignId=${campaign.id}`;
    
    console.log(`Dispatching Firecrawl for ${url}. Webhook: ${webhookUrl}`);

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/batch-scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [url],
        webhook: webhookUrl,
        // Opcional: Formato LLM-ready
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl error:', errorText);
      
      // Revertir estado si falla el dispatch
      await supabase.from('campaigns').update({ scraping_status: 'failed' }).eq('id', campaign.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to dispatch scraper', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlData = await firecrawlResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        campaignId: campaign.id, 
        jobId: firecrawlData.jobId 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
