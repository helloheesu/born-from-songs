import {
  ensureOrbitMessageSchema,
  getDatabase,
  hashClientToken,
  MAX_SUBMISSIONS_PER_HOUR,
  parseStoredPalette,
  validateMessage,
  validatePalette,
} from '@/lib/orbit-messages';

export const dynamic = 'force-dynamic';

type MessageRow = {
  id: string;
  message: string;
  palette_json: string;
  created_at: number;
};

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  try {
    const database = getDatabase();
    await ensureOrbitMessageSchema(database);
    const requested = Number(new URL(request.url).searchParams.get('limit') ?? 6);
    const limit = Math.min(6, Math.max(1, Number.isFinite(requested) ? Math.floor(requested) : 6));
    const pivot = Math.floor(Math.random() * 2_147_483_647);
    const firstResult = await database
      .prepare(`
        SELECT id, message, palette_json, created_at
        FROM orbit_messages
        WHERE status = 'visible' AND sample_key >= ?
        ORDER BY sample_key
        LIMIT ?
      `)
      .bind(pivot, limit)
      .all<MessageRow>();
    const remaining = limit - firstResult.results.length;
    const secondResult = remaining > 0
      ? await database
          .prepare(`
            SELECT id, message, palette_json, created_at
            FROM orbit_messages
            WHERE status = 'visible' AND sample_key < ?
            ORDER BY sample_key
            LIMIT ?
          `)
          .bind(pivot, remaining)
          .all<MessageRow>()
      : { results: [] as MessageRow[] };

    const messages = [...firstResult.results, ...secondResult.results].flatMap((row) => {
      const palette = parseStoredPalette(row.palette_json);
      return palette
        ? [{ id: row.id, message: row.message, palette, createdAt: new Date(row.created_at).toISOString() }]
        : [];
    });
    return json({ messages });
  } catch {
    return json({ messages: [], error: 'messages_unavailable' }, 503);
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: '허용되지 않은 요청입니다.' }, 403);
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 4096) return json({ error: '요청이 너무 큽니다.' }, 413);

  let payload: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 4096) return json({ error: '요청이 너무 큽니다.' }, 413);
    const parsed: unknown = JSON.parse(rawBody);
    if (!isRecord(parsed)) return json({ error: '요청 형식을 확인해 주세요.' }, 400);
    payload = parsed;
  } catch {
    return json({ error: '요청 형식을 확인해 주세요.' }, 400);
  }

  const checkedMessage = validateMessage(payload.message);
  if (!checkedMessage.ok) return json({ error: checkedMessage.reason }, 400);
  const palette = validatePalette(payload.palette);
  if (!palette) return json({ error: '남길 색을 확인해 주세요.' }, 400);
  const clientHash = await hashClientToken(payload.clientToken);
  if (!clientHash) return json({ error: '익명 여행자 정보를 확인할 수 없습니다.' }, 400);

  try {
    const database = getDatabase();
    await ensureOrbitMessageSchema(database);
    const now = Date.now();
    const recent = await database
      .prepare('SELECT COUNT(*) AS count FROM orbit_messages WHERE client_hash = ? AND created_at >= ?')
      .bind(clientHash, now - 60 * 60 * 1000)
      .first<{ count: number }>();
    if ((recent?.count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR) {
      return new Response(JSON.stringify({ error: '잠시 뒤에 다시 남겨 주세요.' }), {
        status: 429,
        headers: { ...jsonHeaders, 'Retry-After': '3600' },
      });
    }

    const id = crypto.randomUUID();
    const sampleKey = Math.floor(Math.random() * 2_147_483_647);
    await database
      .prepare(`
        INSERT INTO orbit_messages (id, message, palette_json, status, sample_key, client_hash, created_at, report_count)
        VALUES (?, ?, ?, 'visible', ?, ?, ?, 0)
      `)
      .bind(id, checkedMessage.message, JSON.stringify(palette), sampleKey, clientHash, now)
      .run();

    return json({ message: { id, message: checkedMessage.message, palette, createdAt: new Date(now).toISOString() } }, 201);
  } catch {
    return json({ error: '지금은 궤도에 남길 수 없습니다.' }, 503);
  }
}
