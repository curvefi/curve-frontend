import { queryFactory } from '@/shared/model/query'
import { createValidationSuite } from '@/shared/lib/validation'

export type AmmBalances = {
  ammBalanceBorrowed: number
  ammBalanceBorrowedUsd: number
  ammBalanceCollateral: number
  ammBalanceCollateralUsd: number | null
}

export type LendingVaultAssets = {
  borrowed: AssetDetails
  collateral: AssetDetails
}

export type AssetDetails = {
  symbol: string
  decimals: number
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
  assets: LendingVaultAssets
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

export type ExtendedLendingVaultFromApi = {
  lendingVaultData: LendingVaultFromApi[]
  tvl: number
}

export const { useQuery: useLendingVaults, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults'] as const,
  queryFn: async () => {
    const response = await fetch('https://api.curve.fi/v1/getLendingVaults/all')
    const { data, success } = (await response.json()) as { data?: ExtendedLendingVaultFromApi; success: boolean }
    if (!success || !data) {
      throw new Error('Failed to fetch pools')
    }
    return data
  },
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}), // no arguments to validate
})
