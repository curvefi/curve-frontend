import { multicall } from '@wagmi/core'
import { type ContractFunctionParameters } from 'viem'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { handleTimeout } from '@ui-kit/utils/time.utils'
import { requireChainId, type Address as UiAddress } from '@ui-kit/utils'
import { buildChainMarketBatch, createOnchainMarketKey, parseChainMarketBatch } from './overlay-market-pass'
import { buildChainUserBatch, parseChainUserBatch } from './overlay-user-pass'

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
}

export type OnchainLlamaMarketsTableData = {
  ratesByKey: Record<string, OnchainMarketRates>
  userStatsByKey: Record<string, OnchainUserMarketStats>
  errorsByKey: Record<string, string>
}

const CHAIN_READ_TIMEOUT_MS = 8_000
export { createOnchainMarketKey }

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

const createEmptyOnchainTableData = (): OnchainLlamaMarketsTableData => ({
  ratesByKey: {},
  userStatsByKey: {},
  errorsByKey: {},
})

const fetchChainTableData = async (
  chainId: number,
  chainMarkets: LlamaMarket[],
  userAddress: UiAddress | undefined,
): Promise<OnchainLlamaMarketsTableData> => {
  const marketBatch = buildChainMarketBatch(chainId, chainMarkets)
  const marketResults = await runMulticall(chainId, marketBatch.contracts)
  const parsedMarket = parseChainMarketBatch({
    chainId,
    chainMarkets,
    meta: marketBatch.meta,
    results: marketResults,
  })

  const tableData: OnchainLlamaMarketsTableData = {
    ratesByKey: parsedMarket.ratesByKey,
    userStatsByKey: {},
    errorsByKey: parsedMarket.errorsByKey,
  }

  if (!userAddress) return tableData

  const userBatch = buildChainUserBatch({ chainMarkets, userAddress })
  const userResults = await runMulticall(chainId, userBatch.contracts)
  const parsedUser = parseChainUserBatch({
    chainMarkets,
    meta: userBatch.meta,
    results: userResults,
    tokenDecimalsByAddress: parsedMarket.tokenDecimalsByAddress,
  })

  tableData.userStatsByKey = parsedUser.userStatsByKey
  Object.assign(tableData.errorsByKey, parsedUser.errorsByKey)

  return tableData
}

export const fetchOnchainLlamaMarketsTableData = async (
  markets: LlamaMarket[],
  userAddress: UiAddress | undefined,
): Promise<OnchainLlamaMarketsTableData> => {
  const grouped: Record<number, LlamaMarket[]> = {}
  for (const market of markets) {
    try {
      const chainId = requireChainId(market.chain)
      if (!grouped[chainId]) grouped[chainId] = []
      grouped[chainId].push(market)
    } catch {
      // Ignore markets with unsupported chain mapping.
    }
  }

  const chainData = await Promise.all(
    Object.entries(grouped).map(async ([chainId, chainMarkets]) => {
      try {
        // Slow RPC on one chain should not block onchain updates from healthy chains.
        return await handleTimeout(
          fetchChainTableData(Number(chainId), chainMarkets, userAddress),
          CHAIN_READ_TIMEOUT_MS,
          `Onchain table data timed out on chain ${chainId}`,
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

  const combined = createEmptyOnchainTableData()
  chainData.forEach((next) => {
    Object.assign(combined.ratesByKey, next.ratesByKey)
    Object.assign(combined.userStatsByKey, next.userStatsByKey)
    Object.assign(combined.errorsByKey, next.errorsByKey)
  })

  return combined
}
