import { useEffect, useMemo, useState } from 'react'
import { erc20Abi, ethAddress, hexToString, isAddress, type Address, type Hex } from 'viem'
import { useConfig, useReadContracts } from 'wagmi'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import type { TokenOption } from '@ui-kit/features/select-token'
import { prefetchTokenBalances, useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { TokenListProps } from './ui/modal/TokenList'

/**
 * Hook to fetch token balances and USD rates for the token selector.
 * Prefetches balances on mount for better UX when opening the modal.
 * Only actively fetches when the modal is open (enabled being true).
 */
export const useTokenSelectorData = (
  {
    tokens,
    chainId,
    userAddress,
  }: {
    tokens: TokenOption[]
    chainId: number
    userAddress?: Address
  },
  {
    enabled,
    prefetch,
    phasedBalanceLoading = false,
    priorityTokenAddresses = [],
  }: {
    enabled: boolean
    prefetch: boolean
    phasedBalanceLoading?: boolean
    priorityTokenAddresses?: Address[]
  },
): Pick<TokenListProps, 'balances' | 'tokenPrices' | 'isLoading'> & { tokenSymbols: Record<string, string> } => {
  const config = useConfig()
  const [fullBalancePhaseKey, setFullBalancePhaseKey] = useState('')
  const tokenAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])
  const tokenAddressSet = useMemo(
    () => new Set(tokenAddresses.map((address) => address.toLowerCase())),
    [tokenAddresses],
  )
  const cachedHeldTokenAddresses = useMemo(
    () => getCachedHeldTokenAddresses({ chainId, userAddress }),
    [chainId, userAddress],
  )
  const phaseOneTokenAddresses = useMemo(() => {
    const priorityAddresses = dedupeAddresses(priorityTokenAddresses)
      .slice(0, MAX_PHASE_ONE_PRIORITY_TOKENS)
      .map((address) => address.toLowerCase())
    const heldAddresses = dedupeAddresses(cachedHeldTokenAddresses)
      .slice(0, MAX_PHASE_ONE_CACHED_HELD_TOKENS)
      .map((address) => address.toLowerCase())
    const phaseOneCandidates = dedupeAddresses([...priorityAddresses, ...heldAddresses]).filter((address) =>
      tokenAddressSet.has(address),
    )

    // First-time users may not have cached held tokens yet.
    if (phaseOneCandidates.length === 0) {
      return tokenAddresses.slice(0, MAX_PHASE_ONE_FALLBACK_TOKENS).map((address) => address.toLowerCase()) as Address[]
    }
    return phaseOneCandidates.slice(0, MAX_PHASE_ONE_TOKEN_BALANCES) as Address[]
  }, [priorityTokenAddresses, cachedHeldTokenAddresses, tokenAddressSet, tokenAddresses])
  const shouldSplitBalanceLoading =
    phasedBalanceLoading &&
    enabled &&
    phaseOneTokenAddresses.length > 0 &&
    phaseOneTokenAddresses.length < tokenAddresses.length
  const splitBalancePhaseKey =
    shouldSplitBalanceLoading && userAddress ? `${chainId}:${userAddress.toLowerCase()}:${tokenAddresses.length}` : ''
  const isFullBalancePhaseEnabled = splitBalancePhaseKey !== '' && fullBalancePhaseKey === splitBalancePhaseKey
  const balanceLookupTokenAddresses = useMemo(() => {
    if (!enabled) return []
    if (!shouldSplitBalanceLoading || isFullBalancePhaseEnabled) return tokenAddresses
    return phaseOneTokenAddresses
  }, [enabled, shouldSplitBalanceLoading, isFullBalancePhaseEnabled, tokenAddresses, phaseOneTokenAddresses])
  const symbolFallbackAddresses = useMemo(
    () =>
      tokens
        .filter((token) => isMissingSymbol(token.symbol))
        .map((token) => token.address)
        .filter(
          (address): address is Address =>
            isAddress(address, { strict: false }) && address.toLowerCase() !== ethAddress,
        ),
    [tokens],
  )

  useEffect(() => {
    if (!splitBalancePhaseKey) return
    return scheduleIdleTask(() => setFullBalancePhaseKey(splitBalancePhaseKey), BALANCE_PHASE_TWO_DELAY_MS)
  }, [splitBalancePhaseKey])
  const symbolLookupAddresses = useMemo(
    () => symbolFallbackAddresses.slice(0, MAX_SYMBOL_LOOKUP),
    [symbolFallbackAddresses],
  )
  const symbolContracts = useMemo(
    () =>
      symbolLookupAddresses.map((address) => ({
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      })),
    [chainId, symbolLookupAddresses],
  )
  const shouldFetchSymbols = enabled && chainId > 0 && symbolContracts.length > 0

  const { data: symbolStringResults } = useReadContracts({
    contracts: shouldFetchSymbols ? symbolContracts : undefined,
    allowFailure: true,
    query: {
      enabled: shouldFetchSymbols,
      staleTime: REFRESH_INTERVAL['1d'],
      refetchOnWindowFocus: false,
    },
  })

  const tokenSymbolsFromString = useMemo(
    () =>
      symbolStringResults?.reduce(
        (acc, result, idx) => {
          if (result.status === 'success' && typeof result.result === 'string') {
            const symbol = sanitizeSymbol(result.result)
            if (symbol) {
              acc[symbolContracts[idx].address.toLowerCase()] = symbol
            }
          }
          return acc
        },
        {} as Record<string, string>,
      ) ?? {},
    [symbolContracts, symbolStringResults],
  )

  const unresolvedSymbolAddresses = useMemo(
    () =>
      symbolLookupAddresses.filter((address) => typeof tokenSymbolsFromString[address.toLowerCase()] === 'undefined'),
    [symbolLookupAddresses, tokenSymbolsFromString],
  )
  const bytes32SymbolContracts = useMemo(
    () =>
      unresolvedSymbolAddresses.map((address) => ({
        chainId,
        address,
        abi: ERC20_SYMBOL_BYTES32_ABI,
        functionName: 'symbol',
      })),
    [chainId, unresolvedSymbolAddresses],
  )
  const shouldFetchBytes32Symbols = shouldFetchSymbols && !!symbolStringResults && unresolvedSymbolAddresses.length > 0

  const { data: symbolBytes32Results } = useReadContracts({
    contracts: shouldFetchBytes32Symbols ? bytes32SymbolContracts : undefined,
    allowFailure: true,
    query: {
      enabled: shouldFetchBytes32Symbols,
      staleTime: REFRESH_INTERVAL['1d'],
      refetchOnWindowFocus: false,
    },
  })

  const tokenSymbolsFromBytes32 = useMemo(
    () =>
      symbolBytes32Results?.reduce(
        (acc, result, idx) => {
          if (result.status === 'success') {
            const symbol = sanitizeBytes32Symbol(result.result)
            if (symbol) {
              acc[bytes32SymbolContracts[idx].address.toLowerCase()] = symbol
            }
          }
          return acc
        },
        {} as Record<string, string>,
      ) ?? {},
    [bytes32SymbolContracts, symbolBytes32Results],
  )

  const tokenSymbols = useMemo(
    () => ({ ...tokenSymbolsFromString, ...tokenSymbolsFromBytes32 }),
    [tokenSymbolsFromBytes32, tokenSymbolsFromString],
  )

  /*
   * Prefetch balances eagerly so they're cached before the modal opens.
   * This reduces the visible "trickle-in" effect of balances loading one by one,
   * minimizing re-renders and providing a smoother user experience.
   * It also means balances are being loaded without creating TanStack subscriptions.
   *
   * Prefetch can be done conditionally such that important data can be loaded first,
   * so that the HTTP request pipeline won't get clogged up with less important requests.
   *
   * At the moment of writing the array of token addresses can contain more than 1000 items.
   * It's up to a future refactor to reduce the amount of token balances fetched.
   */
  useEffect(() => {
    if (prefetch && chainId && userAddress && phaseOneTokenAddresses.length > 0) {
      prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses: phaseOneTokenAddresses })
    }
  }, [prefetch, config, chainId, userAddress, phaseOneTokenAddresses])

  const { data: balances, isLoading: isBalancesLoading } = useTokenBalances(
    { chainId, userAddress, tokenAddresses: balanceLookupTokenAddresses },
    enabled,
  )

  useEffect(() => {
    if (!chainId || !userAddress) return
    if (shouldSplitBalanceLoading && !isFullBalancePhaseEnabled) return

    const heldTokenAddresses = dedupeAddresses(
      recordEntries(balances ?? {})
        .filter(([, balance]) => +balance > 0)
        .map(([address]) => address),
    ).slice(0, MAX_CACHED_HELD_TOKENS)
    if (heldTokenAddresses.length === 0) return

    setCachedHeldTokenAddresses({
      chainId,
      userAddress,
      tokenAddresses: heldTokenAddresses,
    })
  }, [balances, chainId, userAddress, shouldSplitBalanceLoading, isFullBalancePhaseEnabled])

  // Only fetch prices for tokens the user has a balance of
  const tokenAddressesWithBalance = useMemo(
    () =>
      Object.keys(balances ?? {}).length
        ? dedupeAddresses(
            recordEntries(balances)
              .filter(([, balance]) => +balance > 0)
              .map(([address]) => address),
          )
        : [],
    [balances],
  )

  const { data: tokenPrices } = useTokenUsdRates({ chainId, tokenAddresses: tokenAddressesWithBalance }, enabled)

  return { balances, tokenPrices, isLoading: isBalancesLoading, tokenSymbols }
}

const ADDRESS_LABEL_SYMBOL_REGEX = /^0x[a-f0-9]{4}\.\.\.[a-f0-9]{4}$/i
const MAX_SYMBOL_LOOKUP = 300
const MAX_PHASE_ONE_PRIORITY_TOKENS = 36
const MAX_PHASE_ONE_CACHED_HELD_TOKENS = 60
const MAX_PHASE_ONE_FALLBACK_TOKENS = 64
const MAX_PHASE_ONE_TOKEN_BALANCES = 96
const MAX_CACHED_HELD_TOKENS = 160
const BALANCE_PHASE_TWO_DELAY_MS = 350
const HELD_TOKEN_CACHE_KEY = 'curve.select-token.held-token-addresses.v1'
const ERC20_SYMBOL_BYTES32_ABI = [
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
] as const

function scheduleIdleTask(callback: () => void, timeoutMs: number) {
  if (typeof window === 'undefined') return undefined
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: timeoutMs })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(callback, timeoutMs)
  return () => window.clearTimeout(id)
}

function getHeldTokenCacheEntryKey(chainId: number, userAddress: Address) {
  return `${chainId}:${userAddress.toLowerCase()}`
}

function getCachedHeldTokenAddresses({ chainId, userAddress }: { chainId: number; userAddress?: Address }) {
  if (!chainId || !userAddress || typeof window === 'undefined') return []

  const entryKey = getHeldTokenCacheEntryKey(chainId, userAddress)
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HELD_TOKEN_CACHE_KEY) ?? '{}') as Record<string, string[]>
    return dedupeAddresses(parsed[entryKey] ?? [])
  } catch {
    return []
  }
}

function setCachedHeldTokenAddresses({
  chainId,
  userAddress,
  tokenAddresses,
}: {
  chainId: number
  userAddress: Address
  tokenAddresses: string[]
}) {
  if (!chainId || !userAddress || typeof window === 'undefined') return

  const entryKey = getHeldTokenCacheEntryKey(chainId, userAddress)
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HELD_TOKEN_CACHE_KEY) ?? '{}') as Record<string, string[]>
    parsed[entryKey] = dedupeAddresses(tokenAddresses).slice(0, MAX_CACHED_HELD_TOKENS)
    window.localStorage.setItem(HELD_TOKEN_CACHE_KEY, JSON.stringify(parsed))
  } catch {
    // noop on storage parsing/quota errors
  }
}

function isMissingSymbol(symbol: string | undefined) {
  return !symbol || ADDRESS_LABEL_SYMBOL_REGEX.test(symbol)
}

function sanitizeSymbol(symbol: string) {
  return symbol.replaceAll('\0', '').trim()
}

function sanitizeBytes32Symbol(value: unknown) {
  if (typeof value !== 'string') return ''
  try {
    return sanitizeSymbol(hexToString(value as Hex))
  } catch {
    return ''
  }
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
