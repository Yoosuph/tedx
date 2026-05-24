// Supabase Edge Function: cloudinary-destroy
//
// Signs and forwards a Cloudinary `destroy` request for a single Gallery_Item.
// This is the only place the `CLOUDINARY_API_SECRET` is read; the secret is
// never returned, logged, or echoed in any response body or error message.
//
// Design reference:
//   .kiro/specs/cloudinary-gallery-media/design.md
//     "supabase/functions/cloudinary-destroy/index.ts — Delete_Service"
// Validates Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8

import { createClient } from 'jsr:@supabase/supabase-js@2';

interface DestroyRequestBody {
  public_id?: unknown;
  resource_type?: unknown;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Req 5.5 (method): only POST is supported.
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  // Req 5.5 (auth): require a Bearer token and validate it via Supabase Auth.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    // Missing platform env -> treat as unauthorized rather than leaking config.
    return jsonResponse(401, { error: 'unauthorized' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  // Req 5.6 (input): parse JSON body and validate shape.
  let body: DestroyRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'bad json' });
  }

  const publicId = body?.public_id;
  const resourceType = body?.resource_type;

  if (typeof publicId !== 'string' || publicId.length === 0) {
    return jsonResponse(400, { error: 'public_id required' });
  }
  if (resourceType !== 'image' && resourceType !== 'video') {
    return jsonResponse(400, { error: 'resource_type must be image or video' });
  }

  // Req 5.3, 5.4 (secrets): read Cloudinary credentials only from Deno.env.
  const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
  const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
  const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');
  if (!cloudName || !apiKey || !apiSecret) {
    // Do not include the missing variable name in the response (avoids leaking
    // configuration details). Logging is intentionally generic.
    console.error('cloudinary-destroy: missing Cloudinary configuration');
    return jsonResponse(502, { error: 'cloudinary destroy failed' });
  }

  // Req 5.6 (signing): compute timestamp and SHA-1 signature.
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1Hex(stringToSign);

  // Req 5.6 (dispatch): POST FormData to the matching Cloudinary endpoint.
  const form = new FormData();
  form.set('public_id', publicId);
  form.set('api_key', apiKey);
  form.set('timestamp', timestamp);
  form.set('signature', signature);

  let cloudinaryRes: Response;
  try {
    cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: 'POST', body: form },
    );
  } catch (_err) {
    // Req 5.4: never echo signing material; emit a generic error.
    console.error('cloudinary-destroy: network error calling Cloudinary');
    return jsonResponse(502, { error: 'cloudinary destroy failed' });
  }

  let cloudinaryBody: { result?: unknown; error?: { message?: unknown } } = {};
  try {
    cloudinaryBody = await cloudinaryRes.json();
  } catch {
    cloudinaryBody = {};
  }

  // Req 5.7: success when HTTP ok and result is "ok" or "not found".
  if (
    cloudinaryRes.ok &&
    (cloudinaryBody.result === 'ok' || cloudinaryBody.result === 'not found')
  ) {
    return jsonResponse(200, { result: cloudinaryBody.result });
  }

  // Req 5.8: failure -> 502 with a sanitized error message.
  // Req 5.4: do not echo the request body or any signing material.
  const message =
    typeof cloudinaryBody?.error?.message === 'string'
      ? cloudinaryBody.error.message
      : 'cloudinary destroy failed';
  return jsonResponse(502, { error: message });
});
