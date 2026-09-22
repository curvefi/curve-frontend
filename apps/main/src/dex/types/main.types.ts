import { ReactNode } from 'react'
import type { IChainId, INetworkName } from '@curvefi/api/lib/interfaces'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import type { TooltipProps } from '@legacy-ui/Tooltip/types'
import type { NetworkDef } from '@legacy-ui/utils'
import type { Address } from '@primitives/address.utils'
import { BannerProps } from '@ui/features/banners/Banner'

export type { Provider } from '@evm-ui/lib/ethers'
export type { CurveApi, Wallet } from '@evm-ui/features/connect-wallet'

export type ChainId = IChainId
export type NetworkEnum = INetworkName

export type NetworkUrlParams = { network: INetworkName }
export type PoolUrlParams = NetworkUrlParams & { poolIdOrAddress: string }
export type PoolAddressParams = NetworkUrlParams & { poolAddress: Address }
type CrvLockerUrlParams = NetworkUrlParams
export type UrlParams = NetworkUrlParams & Partial<PoolUrlParams & CrvLockerUrlParams>

export type NetworkConfig = {
  isCrvRewardsEnabled: boolean
  poolFilters: string[]
  swap?: Record<string, string>
  swapCustomRouteRedirect: Record<string, string>
  createQuickList: { address: string; symbol: string }[]
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
export type Pool = PoolTemplate
export type ClaimableReward = { token: string; symbol: string; amount: string; price: number }
export type RewardBase = { day: string; week: string }
export type RewardCrv = number

export type PoolsMapper = Record<string, PoolTemplate>
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

export type FnStepApproveResponse = { activeKey: string; hashes: string[]; error: string }

export type FnStepResponse = { activeKey: string; hash: string; error: string }

export enum claimButtonsKey {
  '3CRV' = '3CRV',
  crvUSD = 'crvUSD',
}
