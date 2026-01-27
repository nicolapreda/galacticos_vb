// Cloudflare Worker - CSI Scraper Proxy
// Deploy this on Cloudflare Workers to bypass CSI's IP blocking

export default {
  async fetch(request, env, ctx) {
    // CORS headers for your domain
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Change to 'https://galacticosvb.it' for production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // The CSI URL to scrape
    const targetUrl = 'https://live.centrosportivoitaliano.it/25/Calcio-a-7/Lombardia/Bergamo/C105/?j=NEU9REZIJjRGPVBOSyY0Rz1FREkmNEg9RCY0ST1RICY0TD1ERkgmNDI9ZQ==';

    try {
      // Fetch from CSI with browser-like headers
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        }
      });

      // Get the HTML content
      const html = await response.text();

      // Return with CORS headers
      return new Response(html, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        }
      });

    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
