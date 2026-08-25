import { env } from 'cloudflare:workers';

export const MAX_MESSAGE_LENGTH = 60;
export const MAX_PALETTE_SIZE = 4;
export const MAX_SUBMISSIONS_PER_HOUR = 4;

const CREATE_MESSAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS orbit_messages (
    id TEXT PRIMARY KEY NOT NULL,
    message TEXT NOT NULL,
    palette_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'visible',
    sample_key INTEGER NOT NULL,
    client_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 0
  )
`;

const CREATE_VISIBLE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_orbit_messages_visible_sample
  ON orbit_messages(status, sample_key)
`;

const CREATE_CLIENT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_orbit_messages_client_created
  ON orbit_messages(client_hash, created_at)
`;

const BLOCKED_PATTERNS = [
  /씨+\s*발/iu,
  /시+\s*발(?!점)/iu,
  /병+\s*신/iu,
  /개+\s*(?:새끼|색기)/iu,
  /좆|씹+|엿\s*먹/iu,
  /죽(?:어|여|여버려|이고 싶)/iu,
  /살해|폭파|테러/iu,
  /fuck|shit|bitch|cunt|nigg(?:er|a)/iu,
];

const LINK_PATTERN = /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|kr)\b)/iu;
const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu;
const PHONE_PATTERN = /(?:\+?82[-\s]?)?(?:0?1[016789]|0?2|0?[3-8]\d)[-\s]?\d{3,4}[-\s]?\d{4}/u;
const LONG_NUMBER_PATTERN = /(?:\d[-\s]?){10,}/u;
const CONTACT_HANDLE_PATTERN = /(?:카톡|오픈채팅|텔레그램|telegram|인스타(?:그램)?|instagram|디스코드|discord)\s*[:：]?\s*[@\w.-]{2,}/iu;

let schemaReady: Promise<void> | null = null;

export type StoredOrbitMessage = {
  id: string;
  message: string;
  palette: string[];
  createdAt: string;
};

export function getDatabase(): D1Database {
  if (!env.DB) throw new Error('D1 binding DB is unavailable');
  return env.DB;
}

export async function ensureOrbitMessageSchema(database: D1Database) {
  schemaReady ??= database
    .batch([
      database.prepare(CREATE_MESSAGES_TABLE),
      database.prepare(CREATE_VISIBLE_INDEX),
      database.prepare(CREATE_CLIENT_INDEX),
    ])
    .then(() => undefined)
    .catch((error) => {
      schemaReady = null;
      throw error;
    });
  await schemaReady;
}

export function normalizeMessage(value: unknown) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function validateMessage(value: unknown) {
  const message = normalizeMessage(value);
  const length = Array.from(message).length;
  if (length < 1 || length > MAX_MESSAGE_LENGTH) return { ok: false as const, reason: `메시지는 1~${MAX_MESSAGE_LENGTH}자로 남겨 주세요.` };
  if (
    /[<>]/u.test(message)
    || LINK_PATTERN.test(message)
    || EMAIL_PATTERN.test(message)
    || PHONE_PATTERN.test(message)
    || LONG_NUMBER_PATTERN.test(message)
    || CONTACT_HANDLE_PATTERN.test(message)
  ) {
    return { ok: false as const, reason: '링크나 연락처는 남길 수 없습니다.' };
  }
  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(message))) return { ok: false as const, reason: '다른 문장으로 남겨 주세요.' };
  if (/(.)\1{7,}/u.test(message)) return { ok: false as const, reason: '같은 글자의 반복을 줄여 주세요.' };
  return { ok: true as const, message };
}

export function validatePalette(value: unknown) {
  if (!Array.isArray(value)) return null;
  const palette = [...new Set(value.filter((color): color is string => typeof color === 'string' && /^#[0-9a-f]{6}$/iu.test(color)))]
    .slice(0, MAX_PALETTE_SIZE)
    .map((color) => color.toLowerCase());
  return palette.length > 0 ? palette : null;
}

export function parseStoredPalette(value: string) {
  try {
    return validatePalette(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function hashClientToken(value: unknown) {
  if (typeof value !== 'string' || !/^[a-z0-9-]{20,80}$/iu.test(value)) return null;
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
