import { NextRequest, NextResponse } from 'next/server';

/**
 * CSI Image Proxy
 * 
 * This API route proxies images from CSI through the Cloudflare Worker
 * to bypass 403 Forbidden errors when loading team logos and other assets.
 * 
 * Usage: /api/csi-proxy?url=https://static.centrosportivoitaliano.it/...
 */

const PROXY_URL = process.env.CLOUDFLARE_WORKER_URL || "";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json(
            { error: 'Missing url parameter' },
            { status: 400 }
        );
    }

    // Validate CSI domain
    if (!targetUrl.includes('centrosportivoitaliano.it')) {
        return NextResponse.json(
            { error: 'Invalid URL - only CSI URLs allowed' },
            { status: 400 }
        );
    }

    try {
        let fetchUrl: string;
        let fetchOptions: RequestInit = {};

        if (PROXY_URL) {
            // Use Cloudflare Worker proxy
            fetchUrl = `${PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
            console.log(`🖼️ [CSI-PROXY] Fetching via Cloudflare Worker: ${targetUrl}`);
        } else {
            // Direct fetch with headers (fallback)
            fetchUrl = targetUrl;
            fetchOptions.headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://live.centrosportivoitaliano.it/',
            };
            console.log(`🖼️ [CSI-PROXY] Direct fetch: ${targetUrl}`);
        }

        const response = await fetch(fetchUrl, fetchOptions);

        if (!response.ok) {
            console.error(`❌ [CSI-PROXY] Failed to fetch: ${response.status}`);
            return NextResponse.json(
                { error: `Failed to fetch: ${response.status}` },
                { status: response.status }
            );
        }

        // Get the image data
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        console.log(`✅ [CSI-PROXY] Successfully fetched ${imageBuffer.byteLength} bytes`);

        // Return the image with proper headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('❌ [CSI-PROXY] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
