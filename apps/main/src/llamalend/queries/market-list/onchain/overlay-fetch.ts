import { multicall } from '@wagmi/core'
import { groupBy } from 'lodash'
import { type ContractFunctionParameters } from 'viem'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { handleTimeout } from '@ui-kit/utils/time.utils'
import { requireChainId, type Address as UiAddress } from '@ui-kit/utils'
import { buildChainMarketBatch, parseChainMarketBatch } from './overlay-market-pass'
import { buildChainUserBatch, parseChainUserBatch, resolveConvertFallback } from './overlay-user-pass'

export type OnchainMarketRates = {
  borrowApr?: number
  borrowApy?: number
  lendApr?: number | null
  lendApy?: number | null
}

export type OnchainUserMarketStats = {
  health?: number
  debt?: number
  collateral?: number
  borrowed?: number
  softLiquidation?: boolean
  totalCurrentAssets?: number
  boostMultiplier?: number
}

export type OnchainLlamaMarketsOverlay = {
  ratesByKey: Record<string, OnchainMarketRates>
  userStatsByKey: Record<string, OnchainUserMarketStats>
  errorsByKey: Record<string, string>
}

const CHAIN_READ_TIMEOUT_MS = 8_000

export const createOnchainMarketKey = (chain: LlamaMarket['chain'], controllerAddress: string) =>
  `${chain}:${controllerAddress.toLowerCase()}`

const runMulticall = async (chainId: number, contracts: ContractFunctionParameters[]): Promise<readonly unknown[]> => {
  if (contracts.length === 0) return []

  const config = getWagmiConfig()
  if (!config) throw new Error('Wagmi config is not initialized')

  return multicall(config, {
    chainId,
    contracts,
    allowFailure: true,
  })
}

const emptyOverlay = (): OnchainLlamaMarketsOverlay => ({ ratesByKey: {}, userStatsByKey: {}, errorsByKey: {} })

const fetchChainOverlay = async (
  chainId: number,
  chainMarkets: LlamaMarket[],
  userAddress: UiAddress | undefined,
): Promise<OnchainLlamaMarketsOverlay> => {
  const marketBatch = buildChainMarketBatch(chainId, chainMarkets, !!userAddress)
  const marketResults = await runMulticall(chainId, marketBatch.contracts)
  const parsedMarket = parseChainMarketBatch({
    chainId,
    chainMarkets,
    meta: marketBatch.meta,
    results: marketResults,
  })

  const overlay: OnchainLlamaMarketsOverlay = {
    ratesByKey: parsedMarket.ratesByKey,
    userStatsByKey: {},
    errorsByKey: parsedMarket.errorsByKey,
  }

  if (!userAddress) return overlay

  const userBatch = buildChainUserBatch({
    chainMarkets,
    userAddress,
    gaugesByMarketKey: parsedMarket.gaugesByMarketKey,
  })
  const userResults = await runMulticall(chainId, userBatch.contracts)

  const parsedUser = parseChainUserBatch({
    chainMarkets,
    meta: userBatch.meta,
    results: userResults,
    tokenDecimalsByAddress: parsedMarket.tokenDecimalsByAddress,
    gaugeLookupFailedByKey: parsedMarket.gaugeLookupFailedByKey,
  })

  overlay.userStatsByKey = parsedUser.userStatsByKey
  overlay.errorsByKey = { ...overlay.errorsByKey, ...parsedUser.errorsByKey }

  await resolveConvertFallback({
    chainId,
    requests: parsedUser.convertFallbackRequests,
    userStatsByKey: overlay.userStatsByKey,
    errorsByKey: overlay.errorsByKey,
    tokenDecimalsByAddress: parsedMarket.tokenDecimalsByAddress,
    runMulticall,
  })

  return overlay
}

export const fetchOnchainLlamaMarketsOverlay = async (
  markets: LlamaMarket[],
  userAddress: UiAddress | undefined,
): Promise<OnchainLlamaMarketsOverlay> => {
  const grouped = groupBy(markets, (market) => {
    try {
      return requireChainId(market.chain)
    } catch {
      return -1
    }
  })

  const chainEntries = Object.entries(grouped).filter(([chainId]) => Number(chainId) > 0)

  const chainOverlays = await Promise.all(
    chainEntries.map(async ([chainId, chainMarkets]) => {
      try {
        // Slow RPC on one chain should not block onchain updates from healthy chains.
        return await handleTimeout(
          fetchChainOverlay(Number(chainId), chainMarkets, userAddress),
          CHAIN_READ_TIMEOUT_MS,
          `Onchain overlay timed out on chain ${chainId}`,
        )
      } catch (error) {
        const chainError = error instanceof Error ? error.message : 'Unknown chain read error'
        return {
          ratesByKey: {},
          userStatsByKey: {},
          errorsByKey: Object.fromEntries(
            chainMarkets.map((market) => [createOnchainMarketKey(market.chain, market.controllerAddress), chainError]),
          ),
        }
      }
    }),
  )

  return chainOverlays.reduce(
    (acc, next) => ({
      ratesByKey: { ...acc.ratesByKey, ...next.ratesByKey },
      userStatsByKey: { ...acc.userStatsByKey, ...next.userStatsByKey },
      errorsByKey: { ...acc.errorsByKey, ...next.errorsByKey },
    }),
    emptyOverlay(),
  )
}
