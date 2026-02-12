import { multicall } from '@wagmi/core'
import { formatUnits, parseAbi, type ContractFunctionParameters } from 'viem'
import { type LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-config'
import { handleTimeout } from '@ui-kit/utils/time.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { requireChainId, type Address as UiAddress } from '@ui-kit/utils'

type OnchainMarketRates = {
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

type OnchainLlamaMarketsTableData = {
  ratesByKey: Record<string, OnchainMarketRates>
  userStatsByKey: Record<string, OnchainUserMarketStats>
}

const CHAIN_READ_TIMEOUT_MS = 8_000
const YEAR_SECONDS = 365 * 86400
const ammAbi = parseAbi(['function rate() view returns (uint256)'])
const lendControllerAbi = parseAbi([
  'function total_debt() view returns (uint256)',
  'function user_state(address) view returns (uint256,uint256,uint256,int256)',
  'function health(address,bool) view returns (int256)',
])
const mintControllerAbi = parseAbi([
  'function user_state(address) view returns (uint256,uint256,uint256)',
  'function health(address,bool) view returns (int256)',
])
const vaultAbi = parseAbi(['function totalAssets(address) view returns (uint256)'])

const toFloat = (value: bigint, decimals: number) => Number(formatUnits(value, decimals))
const sanitizeNumber = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? value : undefined

export const createOnchainMarketKey = (chain: LlamaMarket['chain'], controllerAddress: string) =>
  `${chain}:${controllerAddress.toLowerCase()}`

const getSuccessResult = <T>(value: unknown): T | undefined => {
  const item = value as { status: 'success'; result: T } | { status: 'failure'; error: Error }
  return item?.status === 'success' ? item.result : undefined
}

const getMarketTokenDecimals = (market: LlamaMarket) => ({
  borrowed: market.assets.borrowed.decimals || 18,
  collateral: market.assets.collateral.decimals || 18,
})

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
})

const fetchChainMarketTableData = async (
  chainId: number,
  chainMarkets: LlamaMarket[],
): Promise<Pick<OnchainLlamaMarketsTableData, 'ratesByKey'>> => {
  const contracts: ContractFunctionParameters[] = []
  const rateKeys: string[] = []
  const debtKeys: string[] = []
  const capKeys: string[] = []

  chainMarkets.forEach((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)

    contracts.push({ address: market.ammAddress, abi: ammAbi, functionName: 'rate' })
    rateKeys.push(key)

    if (market.type !== LlamaMarketType.Lend || !market.vaultAddress) return

    contracts.push({ address: market.controllerAddress, abi: lendControllerAbi, functionName: 'total_debt' })
    debtKeys.push(key)

    contracts.push({
      address: market.vaultAddress,
      abi: vaultAbi,
      functionName: 'totalAssets',
      args: [market.controllerAddress],
    })
    capKeys.push(key)
  })

  const results = await runMulticall(chainId, contracts)
  const rawByKey: Record<string, { rate?: bigint; debt?: bigint; cap?: bigint }> = {}
  const readResult = (key: string, field: 'rate' | 'debt' | 'cap', result: unknown) => {
    const value = getSuccessResult<bigint>(result)
    if (value != null) rawByKey[key] = { ...(rawByKey[key] ?? {}), [field]: value }
  }

  let resultIndex = 0
  rateKeys.forEach((key) => readResult(key, 'rate', results[resultIndex++]))
  debtKeys.forEach((key) => readResult(key, 'debt', results[resultIndex++]))
  capKeys.forEach((key) => readResult(key, 'cap', results[resultIndex++]))

  const ratesByKey: Record<string, OnchainMarketRates> = {}
  chainMarkets.forEach((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const raw = rawByKey[key]
    if (!raw?.rate) return

    const decimals = getMarketTokenDecimals(market)
    const annualizedRate = toFloat(raw.rate, 18) * YEAR_SECONDS
    const borrowApr = sanitizeNumber(annualizedRate * 100)
    const borrowApy = sanitizeNumber(Math.expm1(annualizedRate) * 100)

    const debt = raw.debt != null ? toFloat(raw.debt, decimals.borrowed) : undefined
    const cap = raw.cap != null ? toFloat(raw.cap, decimals.borrowed) : undefined
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

  return { ratesByKey }
}

const fetchChainUserTableData = async ({
  chainId,
  chainMarkets,
  userAddress,
}: {
  chainId: number
  chainMarkets: LlamaMarket[]
  userAddress: UiAddress
}): Promise<Pick<OnchainLlamaMarketsTableData, 'userStatsByKey'>> => {
  const contracts: ContractFunctionParameters[] = []
  const borrowMarkets: LlamaMarket[] = []

  chainMarkets.forEach((market) => {
    if (!market.userHasPositions?.Borrow) return

    const controllerAbi = market.type === LlamaMarketType.Lend ? lendControllerAbi : mintControllerAbi
    contracts.push({
      address: market.controllerAddress,
      abi: controllerAbi,
      functionName: 'user_state',
      args: [userAddress],
    })
    contracts.push({
      address: market.controllerAddress,
      abi: controllerAbi,
      functionName: 'health',
      args: [userAddress, true],
    })
    borrowMarkets.push(market)
  })

  const results = await runMulticall(chainId, contracts)
  const userStatsByKey: Record<string, OnchainUserMarketStats> = {}

  let resultIndex = 0
  borrowMarkets.forEach((market) => {
    const key = createOnchainMarketKey(market.chain, market.controllerAddress)
    const stateResult = results[resultIndex++]
    const healthResult = results[resultIndex++]

    const state = getSuccessResult<readonly bigint[]>(stateResult)
    const healthRaw = getSuccessResult<bigint>(healthResult)

    if (!state || healthRaw == null) return

    const collateralRaw = state[0]
    const borrowedRaw = state[1]
    const debtRaw = state[2]
    if (collateralRaw == null || borrowedRaw == null || debtRaw == null) return

    const decimals = getMarketTokenDecimals(market)

    const collateral = toFloat(collateralRaw, decimals.collateral)
    const borrowed = toFloat(borrowedRaw, decimals.borrowed)
    const debt = toFloat(debtRaw, decimals.borrowed)
    const health = Number(formatUnits(healthRaw * 100n, 18))

    userStatsByKey[key] = {
      collateral: sanitizeNumber(collateral),
      borrowed: sanitizeNumber(borrowed),
      debt: sanitizeNumber(debt),
      health: sanitizeNumber(health),
      softLiquidation: borrowed > 0,
    }
  })

  return { userStatsByKey }
}

const fetchChainTableData = async (
  chainId: number,
  chainMarkets: LlamaMarket[],
  userAddress: UiAddress | undefined,
): Promise<OnchainLlamaMarketsTableData> => {
  const parsedMarket = await fetchChainMarketTableData(chainId, chainMarkets)

  const tableData: OnchainLlamaMarketsTableData = {
    ratesByKey: parsedMarket.ratesByKey,
    userStatsByKey: {},
  }

  if (!userAddress) return tableData

  const parsedUser = await fetchChainUserTableData({
    chainId,
    chainMarkets,
    userAddress,
  })

  tableData.userStatsByKey = parsedUser.userStatsByKey

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
        void error
        return {
          ratesByKey: {},
          userStatsByKey: {},
        }
      }
    }),
  )

  const combined = createEmptyOnchainTableData()
  chainData.forEach((next) => {
    Object.assign(combined.ratesByKey, next.ratesByKey)
    Object.assign(combined.userStatsByKey, next.userStatsByKey)
  })

  return combined
}
