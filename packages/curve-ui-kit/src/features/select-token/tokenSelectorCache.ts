import type { Address } from 'viem'

type HeldTokenEntry = {
  updatedAt: number
  tokenAddresses: string[]
}

type TokenMetadataEntry = {
  symbol?: string
  decimals?: number
  updatedAt: number
}

type HeldTokenCache = Record<string, HeldTokenEntry>
type TokenMetadataCache = Record<string, TokenMetadataEntry>

const HELD_TOKEN_CACHE_KEY = 'curve.select-token.held-token-addresses.v2'
const TOKEN_METADATA_CACHE_KEY = 'curve.select-token.token-metadata.v1'
const HELD_TOKEN_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
const TOKEN_METADATA_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14
const MAX_CACHED_HELD_TOKENS = 180
const MAX_CACHED_TOKEN_METADATA = 1200

export function getCachedHeldTokenAddresses({ chainId, userAddress }: { chainId: number; userAddress?: Address }) {
  if (!chainId || !userAddress || typeof window === 'undefined') return []
  const cache = parseCache<HeldTokenCache>(window.localStorage.getItem(HELD_TOKEN_CACHE_KEY))
  const entry = cache[getHeldTokenCacheEntryKey(chainId, userAddress)]
  if (!entry) return []
  if (Date.now() - entry.updatedAt > HELD_TOKEN_CACHE_TTL_MS) return []
  return dedupeAddresses(entry.tokenAddresses)
}

export function setCachedHeldTokenAddresses({
  chainId,
  userAddress,
  tokenAddresses,
}: {
  chainId: number
  userAddress: Address
  tokenAddresses: string[]
}) {
  if (!chainId || !userAddress || typeof window === 'undefined') return
  const cache = parseCache<HeldTokenCache>(window.localStorage.getItem(HELD_TOKEN_CACHE_KEY))
  const entryKey = getHeldTokenCacheEntryKey(chainId, userAddress)
  cache[entryKey] = {
    updatedAt: Date.now(),
    tokenAddresses: dedupeAddresses(tokenAddresses).slice(0, MAX_CACHED_HELD_TOKENS),
  }
  writeCache(HELD_TOKEN_CACHE_KEY, cache)
}

export function getCachedTokenMetadata({ chainId, tokenAddresses }: { chainId: number; tokenAddresses: string[] }) {
  if (!chainId || tokenAddresses.length === 0 || typeof window === 'undefined') return {}
  const chainCache = parseCache<Record<string, TokenMetadataCache>>(
    window.localStorage.getItem(TOKEN_METADATA_CACHE_KEY),
  )[chainId.toString()]
  if (!chainCache) return {}

  const now = Date.now()
  const metadata: Record<string, TokenMetadataEntry> = {}
  for (const address of tokenAddresses) {
    const normalized = address.toLowerCase()
    const entry = chainCache[normalized]
    if (!entry) continue
    if (now - entry.updatedAt > TOKEN_METADATA_CACHE_TTL_MS) continue
    metadata[normalized] = entry
  }
  return metadata
}

export function setCachedTokenMetadata({
  chainId,
  metadata,
}: {
  chainId: number
  metadata: Record<string, Omit<TokenMetadataEntry, 'updatedAt'>>
}) {
  if (!chainId || typeof window === 'undefined' || Object.keys(metadata).length === 0) return

  const rootCache = parseCache<Record<string, TokenMetadataCache>>(
    window.localStorage.getItem(TOKEN_METADATA_CACHE_KEY),
  )
  const chainKey = chainId.toString()
  const now = Date.now()
  const previousChainCache = rootCache[chainKey] ?? {}
  const nextChainCache: TokenMetadataCache = { ...previousChainCache }

  for (const [address, nextEntry] of Object.entries(metadata)) {
    const normalized = address.toLowerCase()
    if (!nextEntry.symbol && typeof nextEntry.decimals === 'undefined') continue
    nextChainCache[normalized] = {
      ...nextChainCache[normalized],
      ...nextEntry,
      updatedAt: now,
    }
  }

  const freshEntries = Object.entries(nextChainCache)
    .filter(([, entry]) => now - entry.updatedAt <= TOKEN_METADATA_CACHE_TTL_MS)
    .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CACHED_TOKEN_METADATA)
  rootCache[chainKey] = Object.fromEntries(freshEntries)
  writeCache(TOKEN_METADATA_CACHE_KEY, rootCache)
}

function parseCache<T>(raw: string | null): T {
  if (!raw) return {} as T
  try {
    return JSON.parse(raw) as T
  } catch {
    return {} as T
  }
}

function writeCache(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // noop on storage parsing/quota errors
  }
}

function getHeldTokenCacheEntryKey(chainId: number, userAddress: Address) {
  return `${chainId}:${userAddress.toLowerCase()}`
}

function dedupeAddresses(addresses: string[]) {
  const deduped = new Map<string, string>()
  for (const address of addresses) {
    const normalized = address.toLowerCase()
    if (!deduped.has(normalized)) {
      deduped.set(normalized, address)
    }
  }
  return Array.from(deduped.values())
}
