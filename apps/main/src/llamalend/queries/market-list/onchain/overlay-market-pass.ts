import { NETWORK_CONSTANTS } from '@curvefi/llamalend-api/lib/llamalend'
import { erc20Abi, formatUnits, type Address, type ContractFunctionParameters, zeroAddress } from 'viem'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { LlamaMarketType } from '@ui-kit/types/market'
import { ammAbi, lendControllerAbi, oneWayFactoryAbi, vaultAbi } from './overlay-abi'

type CacheEntry<T> = { value: T; expiresAt: number }

type MarketBatchMeta =
  | { kind: 'tokenDecimals'; tokenAddress: Address }
  | { kind: 'rate'; key: string }
  | { kind: 'totalDebt'; key: string }
  | { kind: 'cap'; key: string }
  | { kind: 'gaugeForVault'; key: string; vaultAddress: Address }

type ChainMulticallBatch = {
  contracts: ContractFunctionParameters[]
  meta: MarketBatchMeta[]
}

type RawRateState = { rate?: bigint; debt?: bigint; cap?: bigint }

type OverlayRate = {
  borrowApr?: number
  borrowApy?: number
  lendApr?: number | null
  lendApy?: number | null
}

export type ParsedChainMarketBatch = {
  ratesByKey: Record<string, OverlayRate>
  errorsByKey: Record<string, string>
  tokenDecimalsByAddress: Record<string, number>
  gaugesByMarketKey: Record<string, Address>
  gaugeLookupFailedByKey: Record<string, true>
}

const YEAR_SECONDS = 365 * 86400
const TOKEN_DECIMALS_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const GAUGE_CACHE_TTL_MS = 5 * 60 * 1000
const tokenDecimalsCache = new Map<string, CacheEntry<number>>()
const gaugeAddressCache = new Map<string, CacheEntry<Address>>()

const now = () => Date.now()
const cacheKey = (chainId: number, address: Address) => `${chainId}:${address.toLowerCase()}`
const readCache = <T>(cache: Map<string, CacheEntry<T>>, key: string) => {
  const cached = cache.get(key)
  if (!cached) return undefined
  if (cached.expiresAt < now()) {
    cache.delete(key)
    return undefined
  }
  return cached.value
}
const writeCache = <T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) => {
  cache.set(key, { value, expiresAt: now() + ttlMs })
}

const getTokenDecimals = (chainId: number, tokenAddress: Address) =>
  readCache(tokenDecimalsCache, cacheKey(chainId, tokenAddress))
const setTokenDecimals = (chainId: number, tokenAddress: Address, decimals: number) =>
  writeCache(tokenDecimalsCache, cacheKey(chainId, tokenAddress), decimals, TOKEN_DECIMALS_CACHE_TTL_MS)
const getGaugeAddress = (chainId: number, vaultAddress: Address) =>
  readCache(gaugeAddressCache, cacheKey(chainId, vaultAddress))
const setGaugeAddress = (chainId: number, vaultAddress: Address, gaugeAddress: Address) =>
  writeCache(gaugeAddressCache, cacheKey(chainId, vaultAddress), gaugeAddress, GAUGE_CACHE_TTL_MS)

const getFactoryAddress = (chainId: number) =>
  NETWORK_CONSTANTS[chainId as keyof typeof NETWORK_CONSTANTS]?.ALIASES?.one_way_factory as Address | undefined

const getSuccessResult = <T>(value: unknown): T | undefined => {
  const item = value as { status: 'success'; result: unknown } | { status: 'failure'; error: Error }
  return item?.status === 'success' ? (item.result as T) : undefined
}

const getFailureError = (value: unknown): Error | undefined => {
  const item = value as { status: 'success'; result: unknown } | { status: 'failure'; error: Error }
  return item?.status === 'failure' ? item.error : undefined
}

const toFloat = (value: bigint, decimals: number) => Number(formatUnits(value, decimals))
const sanitizeNumber = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? value : undefined

export const createOnchainMarketKey = (chain: LlamaMarket['chain'], controllerAddress: string) =>
  `${chain}:${controllerAddress.toLowerCase()}`

export const buildChainMarketBatch = (
  chainId: number,
  chainMarkets: LlamaMarket[],
  includeGaugeCalls: boolean,
): ChainMulticallBatch => {
  const contracts: ContractFunctionParameters[] = []
  const meta: MarketBatchMeta[] = []

  const uniqueTokenAddresses = Array.from(
    new Set(
      chainMarkets.flatMap((market) => [
        market.assets.borrowed.address.toLowerCase(),
        market.assets.collateral.address.toLowerCase(),
      ]),
    ),
  ) as Address[]

  uniqueTokenAddresses.forEach((tokenAddress) => {
    if (getTokenDecimals(chainId, tokenAddress) != null) return

    contracts.push({ address: tokenAddress, abi: erc20Abi, functionName: 'decimals' })
    meta.push({ kind: 'tokenDecimals', tokenAddress })
  })

  const factoryAddress = includeGaugeCalls ? getFactoryAddress(chainId) : undefined

  chainMarkets.forEach((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)

    contracts.push({ address: market.ammAddress, abi: ammAbi, functionName: 'rate' })
    meta.push({ kind: 'rate', key })

    if (market.type === LlamaMarketType.Lend && market.vaultAddress) {
      contracts.push({ address: market.controllerAddress, abi: lendControllerAbi, functionName: 'total_debt' })
      meta.push({ kind: 'totalDebt', key })

      contracts.push({
        address: market.vaultAddress,
        abi: vaultAbi,
        functionName: 'totalAssets',
        args: [market.controllerAddress],
      })
      meta.push({ kind: 'cap', key })
    }

    if (!factoryAddress || !market.vaultAddress || !market.userHasPositions?.Supply) return

    if (getGaugeAddress(chainId, market.vaultAddress as Address) != null) return

    contracts.push({
      address: factoryAddress,
      abi: oneWayFactoryAbi,
      functionName: 'gauge_for_vault',
      args: [market.vaultAddress as Address],
    })
    meta.push({ kind: 'gaugeForVault', key, vaultAddress: market.vaultAddress as Address })
  })

  return { contracts, meta }
}

export const parseChainMarketBatch = ({
  chainId,
  chainMarkets,
  meta,
  results,
}: {
  chainId: number
  chainMarkets: LlamaMarket[]
  meta: MarketBatchMeta[]
  results: readonly unknown[]
}): ParsedChainMarketBatch => {
  const ratesByKey: Record<string, OverlayRate> = {}
  const errorsByKey: Record<string, string> = {}
  const tokenDecimalsByAddress: Record<string, number> = {}
  const gaugesByMarketKey: Record<string, Address> = {}
  const gaugeLookupFailedByKey: Record<string, true> = {}
  const rawRatesByKey: Record<string, RawRateState> = {}

  Array.from(
    new Set(
      chainMarkets.flatMap((market) => [
        market.assets.borrowed.address.toLowerCase(),
        market.assets.collateral.address.toLowerCase(),
      ]),
    ),
  ).forEach((address) => {
    const tokenAddress = address as Address
    const decimals = getTokenDecimals(chainId, tokenAddress)
    if (decimals != null) tokenDecimalsByAddress[tokenAddress.toLowerCase()] = decimals
  })

  chainMarkets.forEach((market) => {
    if (!market.vaultAddress || !market.userHasPositions?.Supply) return
    const cachedGauge = getGaugeAddress(chainId, market.vaultAddress as Address)
    if (!cachedGauge || cachedGauge === zeroAddress) return

    gaugesByMarketKey[createOnchainMarketKey(market.chain, market.controllerAddress)] = cachedGauge
  })

  results.forEach((result, index) => {
    const callMeta = meta[index]
    if (!callMeta) return

    if (callMeta.kind === 'tokenDecimals') {
      const decimals = getSuccessResult<number>(result)
      if (decimals != null) {
        tokenDecimalsByAddress[callMeta.tokenAddress.toLowerCase()] = Number(decimals)
        setTokenDecimals(chainId, callMeta.tokenAddress, Number(decimals))
      }
      return
    }

    if (callMeta.kind === 'gaugeForVault') {
      const gaugeAddress = getSuccessResult<Address>(result)
      if (gaugeAddress != null) {
        setGaugeAddress(chainId, callMeta.vaultAddress, gaugeAddress)
        if (gaugeAddress !== zeroAddress) gaugesByMarketKey[callMeta.key] = gaugeAddress
      } else {
        gaugeLookupFailedByKey[callMeta.key] = true
        const error = getFailureError(result)
        if (error) errorsByKey[callMeta.key] = error.message
      }
      return
    }

    const value = getSuccessResult<bigint>(result)
    if (value == null) {
      const error = getFailureError(result)
      if (error) errorsByKey[callMeta.key] = error.message
      return
    }

    const current = rawRatesByKey[callMeta.key] ?? {}
    if (callMeta.kind === 'rate') current.rate = value
    if (callMeta.kind === 'totalDebt') current.debt = value
    if (callMeta.kind === 'cap') current.cap = value
    rawRatesByKey[callMeta.key] = current
  })

  chainMarkets.forEach((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const raw = rawRatesByKey[key]
    if (!raw?.rate) return

    const borrowedDecimals = tokenDecimalsByAddress[market.assets.borrowed.address.toLowerCase()] ?? 18
    const ratePerSecond = toFloat(raw.rate, 18)
    const annualizedRate = ratePerSecond * YEAR_SECONDS
    const borrowApr = sanitizeNumber(annualizedRate * 100)
    const borrowApy = sanitizeNumber(Math.expm1(annualizedRate) * 100)

    const debt = raw.debt != null ? toFloat(raw.debt, borrowedDecimals) : undefined
    const cap = raw.cap != null ? toFloat(raw.cap, borrowedDecimals) : undefined
    const utilization = debt != null && cap != null && cap > 0 ? debt / cap : undefined

    ratesByKey[key] = {
      ...(borrowApr != null && { borrowApr }),
      ...(borrowApy != null && { borrowApy }),
      ...(market.type === LlamaMarketType.Lend && {
        lendApr: utilization != null ? sanitizeNumber(annualizedRate * utilization * 100) : null,
        lendApy:
          utilization != null ? sanitizeNumber(((debt ?? 0) * Math.expm1(annualizedRate) * 100) / (cap || 1)) : null,
      }),
    }
  })

  return {
    ratesByKey,
    errorsByKey,
    tokenDecimalsByAddress,
    gaugesByMarketKey,
    gaugeLookupFailedByKey,
  }
}
