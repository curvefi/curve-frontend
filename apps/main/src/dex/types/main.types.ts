import { ReactNode } from 'react'
import type { IChainId, INetworkName } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BaseConfig } from '@ui/utils'
import { BannerProps } from '@ui-kit/shared/ui/Banner'

export type { Provider } from '@ui-kit/lib/ethers'
export type { CurveApi, Wallet } from '@ui-kit/features/connect-wallet'

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
  poolIsWrappedOnly: { [poolAddress: string]: boolean }
  poolFilters: string[]
  isActiveNetwork: boolean
  missingPools: { name: string; url: string }[]
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
export type PoolDataCacheMapper = { [poolAddress: string]: PoolDataCache }
export type PoolDataCacheOrApi = PoolData | PoolDataCache

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
