import { useEffect, useMemo } from 'react'
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
  { enabled, prefetch }: { enabled: boolean; prefetch: boolean },
): Pick<TokenListProps, 'balances' | 'tokenPrices' | 'isLoading'> & { tokenSymbols: Record<string, string> } => {
  const config = useConfig()
  const tokenAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])
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
    if (prefetch && chainId && userAddress && tokenAddresses.length > 0) {
      prefetchTokenBalances(config, { chainId, userAddress, tokenAddresses })
    }
  }, [prefetch, config, chainId, userAddress, tokenAddresses])

  const { data: balances, isLoading } = useTokenBalances(
    { chainId, userAddress, tokenAddresses: enabled ? tokenAddresses : [] },
    enabled,
  )

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

  return { balances, tokenPrices, isLoading, tokenSymbols }
}

const ADDRESS_LABEL_SYMBOL_REGEX = /^0x[a-f0-9]{4}\.\.\.[a-f0-9]{4}$/i
const MAX_SYMBOL_LOOKUP = 300
const ERC20_SYMBOL_BYTES32_ABI = [
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bytes32' }],
  },
] as const

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
