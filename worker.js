// Cloudflare Worker — Proxy for OpenRouter API
// Deploy this at: https://workers.cloudflare.com
// Your API key is stored as an environment variable in Cloudflare, never exposed to browsers.

export default {
  async fetch(request, env) {
    // Only allow requests from your portfolio domain
    const allowedOrigins = [
      'https://danakin01.github.io',
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];

    const origin = request.headers.get('Origin') || '';
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o));

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : '',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Only POST allowed
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Block requests from unknown origins
    if (!isAllowed) {
      return new Response('Forbidden', { status: 403 });
    }

    // Forward the request to OpenRouter with the secret API key
    const body = await request.text();

    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://danakin01.github.io',
        'X-Title': 'Daniel Portfolio'
      },
      body: body
    });

    const responseBody = await apiResponse.text();

    return new Response(responseBody, {
      status: apiResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      }
    });
  }
};
