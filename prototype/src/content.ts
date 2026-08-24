import manifest from './content-manifest.json'

interface ContentPayload {
  channel?: 'draft' | 'published'
  releaseId?: string
  updatedAt?: string
  copy?: Record<string, unknown>
}

interface CopyMeta {
  channel: 'draft' | 'published' | 'fallback'
  releaseId: string | null
  updatedAt: string | null
  usingFallback: boolean
}

const defaults = Object.fromEntries(manifest.map((item) => [item.key, item.text])) as Record<string, string>
const limits = Object.fromEntries(manifest.map((item) => [item.key, item.maxLength])) as Record<string, number>
const requiredVariables = Object.fromEntries(
  manifest.map((item) => [item.key, item.variables]),
) as Record<string, string[]>
const knownKeys = new Set(Object.keys(defaults))

let activeCopy = { ...defaults }
let meta: CopyMeta = {
  channel: 'fallback',
  releaseId: null,
  updatedAt: null,
  usingFallback: true,
}

export function copy(key: string): string {
  return activeCopy[key] ?? defaults[key] ?? key
}

export function formatCopy(key: string, variables: Record<string, string | number>): string {
  return copy(key).replace(/\{([a-zA-Z0-9_]+)\}/g, (token, name: string) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : token,
  )
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function copyHtml(key: string): string {
  return escapeHtml(copy(key))
}

export function copyLines(key: string): string {
  return copyHtml(key).replaceAll('\n', '<br />')
}

export function formatCopyHtml(key: string, safeMarkup: Record<string, string>): string {
  return escapeHtml(copy(key)).replace(/\{([a-zA-Z0-9_]+)\}/g, (token, name: string) =>
    Object.prototype.hasOwnProperty.call(safeMarkup, name) ? safeMarkup[name] : token,
  )
}

export function getCopyMeta(): CopyMeta {
  return { ...meta }
}

function hasExactVariables(key: string, value: string): boolean {
  const expected = [...(requiredVariables[key] ?? [])].sort()
  const found = Array.from(value.matchAll(/\{([a-zA-Z0-9_]+)\}/g), (match) => match[1]).sort()
  return expected.length === found.length && expected.every((name, index) => name === found[index])
}

function normalizedRemoteCopy(payload: ContentPayload): Record<string, string> | null {
  if (!payload.copy || typeof payload.copy !== 'object' || Array.isArray(payload.copy)) return null

  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(payload.copy)) {
    if (!knownKeys.has(key) || typeof value !== 'string' || value.trim().length === 0) continue
    const hardLimit = Math.max((limits[key] ?? 200) * 2, 256)
    if (value.length > hardLimit) continue
    if (!hasExactVariables(key, value)) continue
    next[key] = value
  }

  return Object.keys(next).length === knownKeys.size ? next : null
}

export async function loadCopy(): Promise<void> {
  const pageParams = new URLSearchParams(window.location.search)
  const wantsDraft = pageParams.get('copy') === 'draft'
  const token = pageParams.get('token') ?? ''
  const query = new URLSearchParams({ channel: wantsDraft ? 'draft' : 'published' })

  if (wantsDraft && /^[a-zA-Z0-9_-]{16,160}$/.test(token)) query.set('token', token)

  try {
    const response = await fetch(`/api/content?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      cache: wantsDraft ? 'no-store' : 'default',
      signal: AbortSignal.timeout(6000),
    })
    if (!response.ok) return

    const payload = (await response.json()) as ContentPayload
    const remoteCopy = normalizedRemoteCopy(payload)
    if (!remoteCopy) return

    activeCopy = { ...defaults, ...remoteCopy }
    meta = {
      channel: payload.channel === 'draft' ? 'draft' : 'published',
      releaseId: typeof payload.releaseId === 'string' ? payload.releaseId : null,
      updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : null,
      usingFallback: false,
    }
  } catch {
    // The bundled copy remains playable when the editor service is unavailable.
  }
}
