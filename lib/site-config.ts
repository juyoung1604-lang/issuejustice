import { supabaseAdmin } from '@/lib/supabase'

export type SiteConfigMap = Record<string, string>

const SITE_CONFIG_TABLE = 'site_config'
const FALLBACK_BUCKET = 'site-config'
const FALLBACK_PATH = 'site-config.json'

const MISSING_TABLE_PATTERNS = [
  "Could not find the table 'public.site_config'",
  'relation "site_config" does not exist',
]

const MISSING_COLUMN_PATTERNS = [
  'column "updated_at" of relation "site_config" does not exist',
]

const STORAGE_NOT_FOUND_PATTERNS = [
  'not found',
  'NoSuchKey',
  'The resource was not found',
  'Bucket not found',
]

const isSiteConfigTableMissing = (message: string) =>
  MISSING_TABLE_PATTERNS.some((pattern) => message.includes(pattern))

const isUpdatedAtColumnMissing = (message: string) =>
  MISSING_COLUMN_PATTERNS.some((pattern) => message.includes(pattern))

const isStorageObjectMissing = (message: string) => {
  const lower = message.toLowerCase()
  return STORAGE_NOT_FOUND_PATTERNS.some((pattern) => lower.includes(pattern.toLowerCase()))
}

const normalizeConfigMap = (input: unknown): SiteConfigMap => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}

  const out: SiteConfigMap = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    out[key] = typeof value === 'string' ? value : String(value)
  }
  return out
}

async function readFallbackConfig(): Promise<SiteConfigMap> {
  await ensureFallbackBucket()

  const { data, error } = await supabaseAdmin.storage
    .from(FALLBACK_BUCKET)
    .download(FALLBACK_PATH)

  if (error) {
    if (isStorageObjectMissing(error.message)) return {}
    throw new Error(error.message)
  }

  const text = await data.text()
  if (!text.trim()) return {}

  try {
    return normalizeConfigMap(JSON.parse(text))
  } catch {
    return {}
  }
}

async function writeFallbackConfig(config: SiteConfigMap) {
  await ensureFallbackBucket()

  const payload = JSON.stringify(config)
  const { error } = await supabaseAdmin.storage
    .from(FALLBACK_BUCKET)
    .upload(FALLBACK_PATH, payload, {
      upsert: true,
      contentType: 'application/json',
      cacheControl: '0',
    })

  if (error) throw new Error(error.message)
}

async function ensureFallbackBucket() {
  const { data, error } = await supabaseAdmin.storage.listBuckets()
  if (error) throw new Error(error.message)

  const exists = (data ?? []).some((bucket) => bucket.name === FALLBACK_BUCKET)
  if (exists) return

  const { error: createError } = await supabaseAdmin.storage.createBucket(FALLBACK_BUCKET, {
    public: false,
    allowedMimeTypes: ['application/json'],
  })

  if (createError && !createError.message.toLowerCase().includes('already exists')) {
    throw new Error(createError.message)
  }
}

export async function loadSiteConfig(): Promise<{ data: SiteConfigMap; source: 'table' | 'storage' }> {
  const { data, error } = await supabaseAdmin
    .from(SITE_CONFIG_TABLE)
    .select('key, value')

  if (!error) {
    const settings: SiteConfigMap = {}
    for (const row of data || []) {
      settings[row.key] = row.value
    }
    return { data: settings, source: 'table' }
  }

  if (!isSiteConfigTableMissing(error.message)) {
    throw new Error(error.message)
  }

  const fallback = await readFallbackConfig()
  return { data: fallback, source: 'storage' }
}

export async function saveSiteConfigValue(key: string, value: string): Promise<'table' | 'storage'> {
  return saveSiteConfigValues({ [key]: value })
}

export async function saveSiteConfigValues(entries: SiteConfigMap): Promise<'table' | 'storage'> {
  const now = new Date().toISOString()
  const rowWithUpdatedAt = Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: now }))

  const { error } = await supabaseAdmin
    .from(SITE_CONFIG_TABLE)
    .upsert(rowWithUpdatedAt)

  if (!error) return 'table'

  if (isUpdatedAtColumnMissing(error.message)) {
    const rows = Object.entries(entries).map(([key, value]) => ({ key, value }))
    const { error: retryError } = await supabaseAdmin
      .from(SITE_CONFIG_TABLE)
      .upsert(rows)
    if (!retryError) return 'table'
    if (!isSiteConfigTableMissing(retryError.message)) {
      throw new Error(retryError.message)
    }
  } else if (!isSiteConfigTableMissing(error.message)) {
    throw new Error(error.message)
  }

  const current = await readFallbackConfig()
  const merged = { ...current, ...entries }
  await writeFallbackConfig(merged)
  return 'storage'
}
