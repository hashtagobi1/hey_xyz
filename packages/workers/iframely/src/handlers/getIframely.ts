import type { IRequest } from 'itty-router';

import type { Env } from '../types';

export default async (request: IRequest, env: Env) => {
  console.log(request.query);
  try {
    const url = request.query.url as string;

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing URL' })
      );
    }

    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(
      `https://iframely-node.lenster.xyz/iframely?url=${decodedUrl}`
    );

    const encodedSeed = new TextEncoder().encode(url);
    const digest = await crypto.subtle.digest({ name: 'SHA-256' }, encodedSeed);
    const key = [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const data = await response.json();
    const object = await env.LENSTER_IFRAMELY.get(key);

    if (object) {
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      const responseBody = new Response(object.body, { headers });
      const cachedResponse = new Response(
        JSON.stringify({
          success: true,
          cached: true,
          key,
          iframely: await responseBody.json()
        }),
        {
          headers: {
            'Cache-Control': 'public, max-age=31536000'
          }
        }
      );

      return cachedResponse;
    }

    await env.LENSTER_IFRAMELY.put(key, JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true, cached: false, key, iframely: data })
    );
  } catch (error) {
    console.error('Failed to get iframely data', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong!' })
    );
  }
};