import { queryFactory } from '@/shared/model/query'
import { createValidationSuite } from '@/shared/lib/validation'

export interface AmmBalances {
  ammBalanceBorrowed: number
  ammBalanceBorrowedUsd: number
  ammBalanceCollateral: number
  ammBalanceCollateralUsd: number | null
}

export interface LendingVaultAssets {
  borrowed: AssetDetails
  collateral: AssetDetails
}

export interface AssetDetails {
  symbol: string
  decimals: number
  address: string
  blockchainId: string
  usdPrice: number | null
}

export interface CoinValue {
  total: number
  usdTotal: number
}

export interface GaugeReward {
  gaugeAddress: string
  tokenPrice: number
  name: string
  symbol: string
  decimals: string
  tokenAddress: string
  apy: number
  metaData?: GaugeRewardMetadata
}

export interface GaugeRewardMetadata {
  rate: string
  periodFinish: number
}

export interface LendingVaultUrls {
  deposit: string
  withdraw: string
}

export interface LendingRates {
  borrowApr: number
  borrowApy: number
  borrowApyPcent: number
  lendApr: number
  lendApy: number
  lendApyPcent: number
}

export interface VaultShares {
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

export const _getAllLendingVaultsFromApi = async (): Promise<ExtendedLendingVaultFromApi> => {
  const url = `https://api.curve.fi/v1/getLendingVaults/all`
  const response = await fetch(url)
  const { data, success } = (await response.json()) as { data?: ExtendedLendingVaultFromApi; success: boolean }
  if (!success || !data) {
    throw new Error('Failed to fetch pools')
  }
  return data
}

export const { useQuery: useLendingVaults, invalidate: invalidateLendingVaults } = queryFactory({
  queryKey: () => ['lending-vaults'] as const,
  queryFn: _getAllLendingVaultsFromApi,
  staleTime: '5m',
  validationSuite: createValidationSuite(() => {}), // no arguments to validate
})
