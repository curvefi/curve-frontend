import { ReactNode } from 'react'
import type { IChainId, INetworkName } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { BannerProps } from '@evm-ui/shared/ui/Banner'
import type { TooltipProps } from '@legacy-ui/Tooltip/types'
import type { NetworkDef } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'

export type { Provider } from '@evm-ui/lib/ethers'
export type { CurveApi, Wallet } from '@evm-ui/features/connect-wallet'

export type ChainId = IChainId
export type NetworkEnum = INetworkName
export type NetworkConfigFromApi = {
  hasDepositAndStake: boolean | undefined
  hasRouter: boolean | undefined
}

export type NetworkUrlParams = { network: INetworkName }
export type PoolUrlParams = NetworkUrlParams & { poolIdOrAddress: string; formType?: RFormType }
export type PoolAddressParams = NetworkUrlParams & { poolAddress: Address }
type CrvLockerUrlParams = NetworkUrlParams & { formType?: RFormType }
export type UrlParams = NetworkUrlParams & Partial<PoolUrlParams & CrvLockerUrlParams>

export type NetworkConfig = {
  isCrvRewardsEnabled: boolean
  poolIsWrappedOnly: Record<string, boolean>
  poolFilters: string[]
  swap: Record<string, string>
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
} & NetworkDef<NetworkEnum>

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
export type CurrencyReservesMapper = Record<string, CurrencyReserves>
export type RFormType = 'deposit' | 'withdraw' | 'swap' | 'adjust_crv' | 'adjust_date' | 'create' | 'manage-gauge' | ''
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
  error: Record<string, boolean>
}
export type RewardsApyMapper = Record<string, RewardsApy>
export type Token = {
  address: string
  ethAddress?: string
  symbol: string
  decimals: number
  haveSameTokenName: boolean // use to display token address if duplicated token names
  volume?: number
}
export type TokensMapper = Record<string, Token | undefined>
export type TokensNameMapper = Record<string, string>
export type PoolVolumes = Record<string, Decimal>
export type GaugeStatus = { rewardsNeedNudging: boolean; areCrvRewardsStuckInBridge: boolean }

type Gauge = {
  status: GaugeStatus | null
  isKilled: boolean | null
}

export type PoolData = {
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
  failedFetching24hOldVprice: boolean
}

export type PoolDataMapper = Record<string, PoolData>
export type PoolDataCache = {
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

export type PoolAlert = {
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
} & TooltipProps

export type EstimatedGas = number | number[] | null

export type FnStepEstGasApprovalResponse = {
  activeKey: string
  isApproved: boolean
  estimatedGas: EstimatedGas
  error: string
}

export type FnStepApproveResponse = {
  activeKey: string
  hashes: string[]
  error: string
}

export type FnStepResponse = {
  activeKey: string
  hash: string
  error: string
}

export enum claimButtonsKey {
  '3CRV' = '3CRV',
  crvUSD = 'crvUSD',
}
