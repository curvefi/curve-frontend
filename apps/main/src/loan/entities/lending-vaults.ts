import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'

export type AmmBalances = {
  ammBalanceBorrowed: number
  ammBalanceBorrowedUsd: number
  ammBalanceCollateral: number
  ammBalanceCollateralUsd: number | null
}

export type Assets = {
  borrowed: AssetDetails
  collateral: AssetDetails
}

export type AssetDetails = {
  symbol: string
  decimals?: number
  address: string
  blockchainId: string
  usdPrice: number | null
}

export type CoinValue = {
  total: number
  usdTotal: number
}

export type GaugeReward = {
  gaugeAddress: string
  tokenPrice: number
  name: string
  symbol: string
  decimals: string
  tokenAddress: string
  apy: number
  metaData?: GaugeRewardMetadata
}

export type GaugeRewardMetadata = {
  rate: string
  periodFinish: number
}

export type LendingVaultUrls = {
  deposit: string
  withdraw: string
}

export type LendingRates = {
  borrowApr: number
  borrowApy: number
  borrowApyPcent: number
  lendApr: number
  lendApy: number
  lendApyPcent: number
}

export type VaultShares = {
  pricePerShare: number
  totalShares: number
}

export type LendingVaultFromApi = {
  id: string
  name: string
  address: string
  controllerAddress: string
  ammAddress: string
  monetaryPolicyAddress: string
  rates: LendingRates
  gaugeAddress?: string
  gaugeRewards?: GaugeReward[]
  assets: Assets
  vaultShares: VaultShares
  totalSupplied: CoinValue
  borrowed: CoinValue
  availableToBorrow: CoinValue
  lendingVaultUrls: LendingVaultUrls
  usdTotal: number
  ammBalances: AmmBalances
  blockchainId: string
  registryId: 'oneway'
}

type GetLendingVaultResponse = {
  data?: {
    lendingVaultData: LendingVaultFromApi[]
    tvl: number
  }
  success: boolean
}

export const { getQueryOptions: getLendingVaultOptions, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults-v3'] as const,
  queryFn: async () => {
    const response = await fetch('https://api.curve.fi/v1/getLendingVaults/all')
    const { data, success } = (await response.json()) as GetLendingVaultResponse
    if (!success || !data) {
      throw new Error('Failed to fetch pools')
    }
    return {
      ...data,
      lendingVaultData: data.lendingVaultData
        .filter((vault) => vault.totalSupplied.usdTotal)
        .map((vault) => ({
          ...vault,
          utilizationPercent: (100 * vault.borrowed.usdTotal) / vault.totalSupplied.usdTotal,
        })),
    }
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
