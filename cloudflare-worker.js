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

    // Get target URL from query parameter or use default
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url') || 
      'https://live.centrosportivoitaliano.it/25/Calcio-a-7/Lombardia/Bergamo/C105/?j=NEU9REZIJjRGPVBOSyY0Rz1FREkmNEg9RCY0ST1RICY0TD1ERkgmNDI9ZQ==';

    // Validate that URL is from CSI domain
    if (!targetUrl.includes('centrosportivoitaliano.it')) {
      return new Response('Invalid URL - only CSI URLs allowed', { 
        status: 400,
        headers: corsHeaders 
      });
    }

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
          'Cache-Control': 'max-age=0',
          'Referer': 'https://live.centrosportivoitaliano.it/'
        }
      });

      if (!response.ok) {
        return new Response(`Failed to fetch: ${response.status}`, {
          status: response.status,
          headers: corsHeaders
        });
      }

      // Get content type to determine if it's HTML or binary (image)
      const contentType = response.headers.get('content-type') || 'text/html';
      
      // Return the content with CORS headers
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
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
