import { ethers } from 'ethers'
import { ReactNode } from 'react'
import type { SearchParams as PoolListSearchParams } from '@/dex/components/PagePoolList/types'
import type { IChainId, IDict, INetworkName } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BaseConfig } from '@ui/utils'
import { BannerProps } from '@ui-kit/shared/ui/Banner'

export type { CurveApi, Wallet } from '@ui-kit/features/connect-wallet'

export type Balances = IDict<string>
export type Balance = string | IDict<string>
export type ChainId = IChainId | number
export type NetworkEnum = INetworkName
export type NetworkConfigFromApi = {
  hasDepositAndStake: boolean | undefined
  hasRouter: boolean | undefined
}

export type NetworkUrlParams = { network: INetworkName }
export type PoolUrlParams = NetworkUrlParams & { poolIdOrAddress: string; formType?: RFormType }
export type CrvLockerUrlParams = NetworkUrlParams & { formType?: RFormType }
export type UrlParams = NetworkUrlParams & Partial<PoolUrlParams & CrvLockerUrlParams>

export interface NetworkConfig extends BaseConfig<NetworkEnum> {
  isLite: boolean
  isCrvRewardsEnabled: boolean
  useApi: boolean
  excludePoolsMapper: { [key: string]: boolean }
  poolCustomTVL: { [poolAddress: string]: string }
  poolIsWrappedOnly: { [poolAddress: string]: boolean }
  poolFilters: string[]
  hideSmallPoolsTvl: number
  isActiveNetwork: boolean
  missingPools: { name: string; url: string }[]
  poolListFormValuesDefault: Partial<PoolListSearchParams>
  swap: { [key: string]: string }
  showInSelectNetwork: boolean
  showRouterSwap: boolean
  swapCustomRouteRedirect: {
    [key: string]: string
  }
  createQuickList: {
    address: string
    haveSameTokenName: boolean
    symbol: string
  }[]
  createDisabledTokens: string[]
  stableswapFactoryOld: boolean
  stableswapFactory: boolean
  twocryptoFactoryOld: boolean
  twocryptoFactory: boolean
  tricryptoFactory: boolean
  fxswapFactory: boolean
  hasFactory: boolean
  pricesApi: boolean
}

export type Networks = Record<ChainId, NetworkConfig>
export type CurrencyReservesToken = {
  token: string
  tokenAddress: string
  balance: number
  balanceUsd: number
  usdRate: number
  percentShareInPool: string
}
export type CurrencyReserves = {
  poolId: string
  tokens: CurrencyReservesToken[]
  total: string
  totalUsd: string
}
export type CurrencyReservesMapper = { [chainPoolId: string]: CurrencyReserves }
export const FormTypes = [
  'deposit',
  'withdraw',
  'swap',
  'adjust_crv',
  'adjust_date',
  'create',
  'manage-gauge',
  '',
] as const
export type RFormType = (typeof FormTypes)[number]
export type Pool = PoolTemplate
export type Provider = ethers.BrowserProvider
export type ClaimableReward = {
  token: string
  symbol: string
  amount: string
  price: number
}
export type RewardBase = {
  day: string
  week: string
}
export type RewardCrv = number
export type RewardOther = {
  apy: number
  decimals?: number
  gaugeAddress: string
  name?: string
  symbol: string
  tokenAddress: string
  tokenPrice?: number
}
export type RewardsApy = {
  poolId: string
  base: RewardBase
  other: RewardOther[]
  crv: RewardCrv[]
  error: { [rewardType: string]: boolean }
}
export type RewardsApyMapper = { [poolId: string]: RewardsApy }
export type PoolParameters = {
  A: string
  adminFee: string
  fee: string
  future_A?: string
  future_A_time?: number
  gamma?: string
  initial_A?: string
  initial_A_time?: number
  lpTokenSupply: string
  priceOracle?: string[]
  priceScale?: string[]
  virtualPrice: string
}
export type Token = {
  address: string
  ethAddress?: string
  symbol: string
  decimals: number
  haveSameTokenName: boolean // use to display token address if duplicated token names
  volume?: number
}
export type TokensMapper = { [tokenAddress: string]: Token | undefined }
export type TokensNameMapper = { [tokenAddress: string]: string }
export type UserBalancesMapper = { [tokenAddress: string]: string | undefined }
export type GaugeStatus = { rewardsNeedNudging: boolean; areCrvRewardsStuckInBridge: boolean }

export interface Gauge {
  status: GaugeStatus | null
  isKilled: boolean | null
}

export interface PoolData {
  idx?: number
  chainId: ChainId
  pool: Pool
  gauge: Gauge
  hasWrapped: boolean
  hasVyperVulnerability: boolean
  isWrapped: boolean
  currenciesReserves: CurrencyReserves | null
  parameters: PoolParameters
  tokenAddresses: string[]
  tokenAddressesAll: string[]
  tokenDecimalsAll: number[]
  tokens: string[]
  tokensCountBy: { [key: string]: number }
  tokensAll: string[]
  tokensLowercase: string[]
  curvefiUrl: string
  failedFetching24hOldVprice: boolean
}

export type BasePool = {
  id: string
  name: string
  token: string
  pool: string
  coins: string[]
}
export type PoolDataMapper = { [poolAddress: string]: PoolData }
export type PoolDataCache = {
  gauge: Gauge
  hasWrapped: boolean
  hasVyperVulnerability: boolean
  tokenAddresses: string[]
  tokenAddressesAll: string[]
  tokens: string[]
  tokensCountBy: { [key: string]: number }
  tokensAll: string[]
  tokensLowercase: string[]
  pool: {
    id: string
    name: string
    address: string
    gauge: { address: string }
    lpToken: string
    isCrypto: boolean
    isNg: boolean
    isFactory: boolean
    isLending: boolean
    implementation: string
    referenceAsset: string
  }
}
export type PricesApiPoolData = {
  name: string
  registry: string
  lp_token_address: string
  coins: {
    pool_index: number
    symbol: string
    address: string
  }[]
  pool_type: string
  metapool: boolean | null
  base_pool: string | null
  asset_types: number[]
  oracles: {
    oracle_address: string
    method_id: string
    method: string
  }[]
  vyper_version: string
}
export type SnapshotsMapper = { [poolAddress: string]: PricesApiSnapshotsData }
export type PricesApiSnapshotsData = {
  timestamp: number
  a: number
  fee: number
  admin_fee: number
  virtual_price: number
  xcp_profit: number
  xcp_profit_a: number
  base_daily_apr: number
  base_weekly_apr: number
  offpeg_fee_multiplier: number
  gamma: number
  mid_fee: number
  out_fee: number
  fee_gamma: number
  allowed_extra_profit: number
  adjustment_step: number
  ma_half_time: number
  price_scale: number[]
  price_oracle: number[]
  block_number: number
}
export type PricesApiSnapshotsResponse = {
  address: string
  chain: string
  data: PricesApiSnapshotsData[]
}
export type PoolDataCacheMapper = { [poolAddress: string]: PoolDataCache }
export type PoolDataCacheOrApi = PoolData | PoolDataCache

export type Tvl = {
  poolId: string
  value: string
  errorMessage: string
}
export type TvlMapper = { [poolId: string]: Tvl }
export type ValueMapperCached = { [poolId: string]: { value: string } }
export type UserPoolListMapper = { [poolId: string]: boolean }
export type Volume = {
  poolId: string
  value: string
  errorMessage: string
}
export type VolumeMapper = { [poolId: string]: Volume }
export type AlertType = 'info' | 'warning' | 'error' | 'danger' | ''

export interface PoolAlert extends TooltipProps {
  alertType: AlertType
  isDisableDeposit?: boolean
  isDisableSwap?: boolean
  // disable only the withdraw sub tab. Unstake and Claim sub tabs still available
  isDisableWithdrawOnly?: boolean
  isInformationOnly?: boolean
  isInformationOnlyAndShowInForm?: boolean
  isCloseOnTooltipOnly?: boolean
  // banner message, related to the market situation
  banner?: Omit<BannerProps, 'children'> & { title: string }
  isPoolPageOnly?: boolean // Don't show the pools overview table
  address?: string
  // action card message, related to action of user
  message?: ReactNode
}

export type EstimatedGas = number | number[] | null

export interface FnStepEstGasApprovalResponse {
  activeKey: string
  isApproved: boolean
  estimatedGas: EstimatedGas
  error: string
}

export interface FnStepApproveResponse {
  activeKey: string
  hashes: string[]
  error: string
}

export interface FnStepResponse {
  activeKey: string
  hash: string
  error: string
}

export enum claimButtonsKey {
  '3CRV' = '3CRV',
  crvUSD = 'crvUSD',
}
