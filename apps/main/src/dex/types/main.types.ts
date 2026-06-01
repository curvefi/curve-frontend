import { ReactNode } from 'react'
import type { IChainId, INetworkName } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { Address } from '@primitives/address.utils'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BaseConfig } from '@ui/utils'
import { BannerProps } from '@ui-kit/shared/ui/Banner'

export type { Provider } from '@ui-kit/lib/ethers'
export type { CurveApi, Wallet } from '@ui-kit/features/connect-wallet'

export type ChainId = IChainId
export type NetworkEnum = INetworkName
export interface NetworkConfigFromApi {
  hasDepositAndStake: boolean | undefined
  hasRouter: boolean | undefined
}

export interface NetworkUrlParams {
  network: INetworkName
}
export type PoolUrlParams = NetworkUrlParams & { poolIdOrAddress: string; formType?: RFormType }
export type PoolAddressParams = NetworkUrlParams & { poolAddress: Address }
export type CrvLockerUrlParams = NetworkUrlParams & { formType?: RFormType }
export type UrlParams = NetworkUrlParams & Partial<PoolUrlParams & CrvLockerUrlParams>

export interface NetworkConfig extends BaseConfig<NetworkEnum> {
  isLite: boolean
  isCrvRewardsEnabled: boolean
  useApi: boolean
  poolIsWrappedOnly: Record<string, boolean>
  poolFilters: string[]
  isActiveNetwork: boolean
  missingPools: { name: string; url: string }[]
  swap: Record<string, string>
  showInSelectNetwork: boolean
  showRouterSwap: boolean
  swapCustomRouteRedirect: Record<string, string>
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
export interface CurrencyReservesToken {
  token: string
  tokenAddress: string
  balance: number
  balanceUsd: number
  usdRate: number
  percentShareInPool: string
}
export interface CurrencyReserves {
  poolId: string
  tokens: CurrencyReservesToken[]
  total: string
  totalUsd: string
}
export type CurrencyReservesMapper = Record<string, CurrencyReserves>
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
export interface ClaimableReward {
  token: string
  symbol: string
  amount: string
  price: number
}
export interface RewardBase {
  day: string
  week: string
}
export type RewardCrv = number
export interface RewardOther {
  apy: number
  decimals?: number
  gaugeAddress: string
  name?: string
  symbol: string
  tokenAddress: string
  tokenPrice?: number
}
export interface RewardsApy {
  poolId: string
  base: RewardBase
  other: RewardOther[]
  crv: RewardCrv[]
  error: Record<string, boolean>
}
export type RewardsApyMapper = Record<string, RewardsApy>
export interface Token {
  address: string
  ethAddress?: string
  symbol: string
  decimals: number
  haveSameTokenName: boolean // use to display token address if duplicated token names
  volume?: number
}
export type TokensMapper = Record<string, Token | undefined>
export type TokensNameMapper = Record<string, string>
export interface GaugeStatus {
  rewardsNeedNudging: boolean
  areCrvRewardsStuckInBridge: boolean
}

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
  tokensCountBy: Record<string, number>
  tokensAll: string[]
  tokensLowercase: string[]
  curvefiUrl: string
  failedFetching24hOldVprice: boolean
}

export type PoolDataMapper = Record<string, PoolData>
export interface PoolDataCache {
  gauge: Gauge
  hasWrapped: boolean
  hasVyperVulnerability: boolean
  tokenAddresses: string[]
  tokenAddressesAll: string[]
  tokenDecimalsAll: number[]
  tokens: string[]
  tokensCountBy: Record<string, number>
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
export type PoolDataCacheMapper = Record<string, PoolDataCache>
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
