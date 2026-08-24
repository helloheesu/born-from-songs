import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

type RuntimeEnv = {
  APPS_SCRIPT_CONTENT_URL?: string;
};

type UpstreamPayload = {
  ok?: boolean;
  channel?: string;
  releaseId?: string | null;
  release_id?: string | null;
  updatedAt?: string | null;
  generated_at?: string | null;
  copy?: Record<string, unknown>;
};

const MAX_BODY_BYTES = 256_000;
const TOKEN_PATTERN = /^[a-zA-Z0-9_-]{16,160}$/;

function failure(status: number, code: string): Response {
  return Response.json(
    { ok: false, error: { code } },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}

function validCopy(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length < 1 || entries.length > 200) return false;

  return entries.every(
    ([key, text]) =>
      /^[a-z0-9_.-]{2,100}$/.test(key) &&
      typeof text === 'string' &&
      text.length > 0 &&
      text.length <= 1000,
  );
}

export async function GET(request: Request): Promise<Response> {
  const configured = (env as unknown as RuntimeEnv).APPS_SCRIPT_CONTENT_URL?.trim();
  if (!configured) return failure(503, 'CONTENT_NOT_CONFIGURED');

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(configured);
    if (upstreamUrl.protocol !== 'https:' || upstreamUrl.hostname !== 'script.google.com') {
      return failure(503, 'CONTENT_NOT_CONFIGURED');
    }
  } catch {
    return failure(503, 'CONTENT_NOT_CONFIGURED');
  }

  const incoming = new URL(request.url).searchParams;
  const channel = incoming.get('channel') === 'draft' ? 'draft' : 'published';
  const token = incoming.get('token') ?? '';
  if (channel === 'draft' && !TOKEN_PATTERN.test(token)) {
    return failure(403, 'INVALID_PREVIEW_TOKEN');
  }

  upstreamUrl.search = '';
  upstreamUrl.searchParams.set('channel', channel.toUpperCase());
  if (channel === 'draft') upstreamUrl.searchParams.set('token', token);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json, text/plain;q=0.9' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) return failure(502, 'CONTENT_UPSTREAM_ERROR');

    const body = await upstream.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return failure(502, 'CONTENT_TOO_LARGE');
    }

    const payload = JSON.parse(body) as UpstreamPayload;
    if (payload.ok !== true || !validCopy(payload.copy)) {
      return failure(channel === 'draft' ? 403 : 502, 'CONTENT_INVALID_RESPONSE');
    }

    const normalized = {
      channel,
      releaseId: payload.releaseId ?? payload.release_id ?? null,
      updatedAt: payload.updatedAt ?? payload.generated_at ?? null,
      copy: payload.copy,
    };

    return Response.json(normalized, {
      headers: {
        'Cache-Control':
          channel === 'draft'
            ? 'no-store'
            : 'public, max-age=0, s-maxage=60, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException &&
      (error.name === 'TimeoutError' || error.name === 'AbortError');
    return failure(timedOut ? 504 : 502, timedOut ? 'CONTENT_TIMEOUT' : 'CONTENT_INVALID_RESPONSE');
  }
}
