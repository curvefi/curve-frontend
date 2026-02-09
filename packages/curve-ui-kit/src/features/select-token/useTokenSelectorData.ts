import { useEffect, useMemo, useState } from 'react'
import { erc20Abi, ethAddress, hexToString, isAddress, type Address, type Hex } from 'viem'
import { useConfig, useReadContracts } from 'wagmi'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import type { TokenOption } from '@ui-kit/features/select-token'
import { prefetchTokenBalances, useTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useTokenUsdRates } from '@ui-kit/lib/model/entities/token-usd-rate'
import {
  getCachedHeldTokenAddresses,
  getCachedTokenMetadata,
  setCachedHeldTokenAddresses,
  setCachedTokenMetadata,
} from './tokenSelectorCache'
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
  const [fullBalancePhaseState, setFullBalancePhaseState] = useState<{ key: string; enabled: boolean }>({
    key: '',
    enabled: false,
  })
  const tokenAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])
  const tokenAddressSet = useMemo(
    () => new Set(tokenAddresses.map((address) => address.toLowerCase())),
    [tokenAddresses],
  )
  const fallbackPhaseOneTokenAddresses = useMemo(
    () =>
      [...tokens]
        .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0) || a.symbol.localeCompare(b.symbol))
        .slice(0, MAX_PHASE_ONE_FALLBACK_TOKENS)
        .map((token) => token.address.toLowerCase()) as Address[],
    [tokens],
  )
  const cachedHeldTokenAddresses = useMemo(
    () => getCachedHeldTokenAddresses({ chainId, userAddress }),
    [chainId, userAddress],
  )
  const cachedTokenMetadata = useMemo(
    () => getCachedTokenMetadata({ chainId, tokenAddresses }),
    [chainId, tokenAddresses],
  )
  const cachedTokenSymbols = useMemo(
    () =>
      Object.entries(cachedTokenMetadata).reduce(
        (acc, [address, metadata]) => {
          const symbol = metadata.symbol?.trim()
          if (symbol && !isMissingSymbol(symbol)) {
            acc[address] = symbol
          }
          return acc
        },
        {} as Record<string, string>,
      ),
    [cachedTokenMetadata],
  )
  const phaseOneTokenAddresses = useMemo(() => {
    const priorityAddresses = dedupeAddresses(priorityTokenAddresses)
      .slice(0, MAX_PHASE_ONE_PRIORITY_TOKENS)
      .map((address) => address.toLowerCase())
    const heldAddresses = dedupeAddresses(cachedHeldTokenAddresses)
      .slice(0, MAX_PHASE_ONE_CACHED_HELD_TOKENS)
      .map((address) => address.toLowerCase())
    const phaseOneCandidates = dedupeAddresses([
      ...priorityAddresses,
      ...heldAddresses,
      ...fallbackPhaseOneTokenAddresses,
    ])
      .filter((address) => tokenAddressSet.has(address))
      .slice(0, MAX_PHASE_ONE_TOKEN_BALANCES)
    return phaseOneCandidates as Address[]
  }, [priorityTokenAddresses, cachedHeldTokenAddresses, fallbackPhaseOneTokenAddresses, tokenAddressSet])
  const shouldSplitBalanceLoading =
    phasedBalanceLoading &&
    enabled &&
    !!userAddress &&
    phaseOneTokenAddresses.length > 0 &&
    phaseOneTokenAddresses.length < tokenAddresses.length
  const splitBalancePhaseKey = shouldSplitBalanceLoading
    ? `${chainId}:${userAddress!.toLowerCase()}:${tokenAddresses.length}:${phaseOneTokenAddresses.join(',')}`
    : ''
  const isFullBalancePhaseEnabled = fullBalancePhaseState.enabled && fullBalancePhaseState.key === splitBalancePhaseKey

  const phaseOneQueryEnabled = !!userAddress && shouldSplitBalanceLoading && !isFullBalancePhaseEnabled
  const fullBalanceQueryEnabled = !!userAddress && enabled && (!shouldSplitBalanceLoading || isFullBalancePhaseEnabled)

  const phaseOneBalances = useTokenBalances(
    { chainId, userAddress, tokenAddresses: phaseOneTokenAddresses },
    phaseOneQueryEnabled,
  )
  const fullBalances = useTokenBalances({ chainId, userAddress, tokenAddresses }, fullBalanceQueryEnabled)
  const phaseOneReady = !phaseOneQueryEnabled || !phaseOneBalances.isLoading
  const balances = useMemo(
    () =>
      shouldSplitBalanceLoading
        ? { ...(phaseOneBalances.data ?? {}), ...(fullBalances.data ?? {}) }
        : (fullBalances.data ?? phaseOneBalances.data ?? {}),
    [fullBalances.data, phaseOneBalances.data, shouldSplitBalanceLoading],
  )

  useEffect(() => {
    if (!splitBalancePhaseKey || !shouldSplitBalanceLoading || isFullBalancePhaseEnabled || !enabled || !phaseOneReady)
      return
    return scheduleIdleTask(
      () => setFullBalancePhaseState({ key: splitBalancePhaseKey, enabled: true }),
      BALANCE_PHASE_TWO_DELAY_MS,
    )
  }, [enabled, isFullBalancePhaseEnabled, phaseOneReady, shouldSplitBalanceLoading, splitBalancePhaseKey])

  const symbolFallbackAddresses = useMemo(
    () =>
      tokens
        .filter((token) => isMissingSymbol(token.symbol) && !cachedTokenSymbols[token.address.toLowerCase()])
        .map((token) => token.address)
        .filter(
          (address): address is Address =>
            isAddress(address, { strict: false }) && address.toLowerCase() !== ethAddress,
        ),
    [tokens, cachedTokenSymbols],
  )

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
    () => ({ ...cachedTokenSymbols, ...tokenSymbolsFromString, ...tokenSymbolsFromBytes32 }),
    [cachedTokenSymbols, tokenSymbolsFromBytes32, tokenSymbolsFromString],
  )

  useEffect(() => {
    if (!chainId) return
    const metadataToCache = Object.entries({ ...tokenSymbolsFromString, ...tokenSymbolsFromBytes32 }).reduce(
      (acc, [address, symbol]) => {
        if (symbol) {
          acc[address] = { symbol }
        }
        return acc
      },
      {} as Record<string, { symbol: string }>,
    )
    if (Object.keys(metadataToCache).length === 0) return
    setCachedTokenMetadata({ chainId, metadata: metadataToCache })
  }, [chainId, tokenSymbolsFromBytes32, tokenSymbolsFromString])

  /*
   * Prefetch balances eagerly so they're cached before the modal opens.
   * This reduces the visible "trickle-in" effect of balances loading one by one,
   * minimizing re-renders and providing a smoother user experience.
   */
  useEffect(() => {
    if (prefetch && chainId && userAddress && phaseOneTokenAddresses.length > 0) {
      prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses: phaseOneTokenAddresses })
    }
  }, [prefetch, config, chainId, userAddress, phaseOneTokenAddresses])

  useEffect(() => {
    if (!chainId || !userAddress || !isFullBalancePhaseEnabled) return

    const heldTokenAddresses = dedupeAddresses(
      recordEntries(balances ?? {})
        .filter(([, balance]) => +balance > 0)
        .map(([address]) => address),
    )
    if (heldTokenAddresses.length === 0) return

    setCachedHeldTokenAddresses({
      chainId,
      userAddress,
      tokenAddresses: heldTokenAddresses,
    })
  }, [balances, chainId, isFullBalancePhaseEnabled, userAddress])

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
  const isBalancesLoading = shouldSplitBalanceLoading ? phaseOneBalances.isLoading : fullBalances.isLoading

  return { balances, tokenPrices, isLoading: isBalancesLoading, tokenSymbols }
}

const ADDRESS_LABEL_SYMBOL_REGEX = /^0x[a-f0-9]{4}\.\.\.[a-f0-9]{4}$/i
const MAX_SYMBOL_LOOKUP = 300
const MAX_PHASE_ONE_PRIORITY_TOKENS = 28
const MAX_PHASE_ONE_CACHED_HELD_TOKENS = 44
const MAX_PHASE_ONE_FALLBACK_TOKENS = 56
const MAX_PHASE_ONE_TOKEN_BALANCES = 72
const BALANCE_PHASE_TWO_DELAY_MS = 300
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
  const id = globalThis.setTimeout(callback, timeoutMs)
  return () => globalThis.clearTimeout(id)
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
