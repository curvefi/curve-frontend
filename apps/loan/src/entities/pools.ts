import { IExtendedPoolDataFromApi, IPoolDataFromApi } from '@curvefi/lending-api/lib/interfaces'
import { queryFactory } from '@/shared/model/query'
import { createValidationSuite } from '@/shared/lib/validation'

export type PoolGaugeReward = {
  gaugeAddress: string
  tokenAddress: string
  tokenPrice?: number
  name?: string
  symbol: string
  decimals?: number
  apy: number
}

export type PoolCoin = {
  address: string
  usdPrice: number
  decimals: string
  isBasePoolLpToken: boolean
  symbol: string
  name: string
  poolBalance: string
}

export type PoolFromApi = {
  id: string
  address: string
  coinsAddresses: string[]
  decimals: string[]
  virtualPrice: string
  amplificationCoefficient: string
  totalSupply: string
  name: string
  assetType: string
  lpTokenAddress: string
  priceOracle: string | null
  priceOracles: string[] | null
  symbol: string
  implementation: string
  assetTypeName: string
  coins: PoolCoin[]
  poolUrls: {
    swap: [string, string]
    deposit: [string, string]
    withdraw: [string, string]
  }

  usdTotal: number
  isMetaPool: boolean
  usdTotalExcludingBasePool: number
  gaugeAddress: string
  gaugeRewards: PoolGaugeReward[]
  gaugeCrvApy: number[]
  gaugeFutureCrvApy: number[]
  usesRateOracle: boolean
  isBroken: boolean
  hasMethods: {
    exchange_received: boolean
    exchange_extended: boolean
  }

  implementationAddress?: string
  creationTs: number
  creationBlockNumber: number
  blockchainId: string
  registryId: string
}
export type ExtendedPoolDataFromApi = {
  poolData: PoolFromApi[];
  tvl?: number;
  tvlAll: number;
}

export const _getPoolsFromApi = async (): Promise<ExtendedPoolDataFromApi> => {
  const url = `https://api.curve.fi/api/getPools/all`
  const response = await fetch(url)
  const { data, success } = await response.json()
  if (!success || !data) {
    throw new Error('Failed to fetch pools')
  }
  return data
}

export const { useQuery: usePoolsQuery, invalidate: invalidatePoolsQuery } = queryFactory({
  queryKey: () => ['pools'] as const,
  queryFn: _getPoolsFromApi,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}),
})
