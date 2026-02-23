import { BrowserProvider } from 'ethers'
import type { ReactNode } from 'react'
import type { HealthColorKey } from '@/llamalend/llamalend.types'
import { TITLE } from '@/loan/constants'
import { crvusdjsApi as curvejsApi } from '@/loan/lib/apiCrvusd'
import type { INetworkName, IRates } from '@curvefi/llamalend-api/lib/interfaces'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BaseConfig } from '@ui/utils'

export type { LlamaApi, Wallet } from '@ui-kit/features/connect-wallet'

export type ChainId = 1 // note lend also has other chains, but we only use eth in this app

/** LOAN app specific API that constrains chainId to Ethereum only */
export type NetworkEnum = Extract<INetworkName, 'ethereum'>

export type NetworkUrlParams = { network: NetworkEnum }
export type CollateralUrlParams = NetworkUrlParams & { collateralId: string }
export type UrlParams = NetworkUrlParams & Partial<CollateralUrlParams>

export type AlertType = 'info' | 'warning' | 'error' | 'danger'

export type Provider = BrowserProvider

export interface NetworkConfig extends BaseConfig<NetworkEnum, ChainId> {
  api: typeof curvejsApi
  isActiveNetwork: boolean
  showInSelectNetwork: boolean
}

export type Llamma = MintMarketTemplate

export type LiqRange = {
  prices: string[]
  bands: [number, number]
}
export type LoanPriceInfo = {
  oraclePrice: string
  oraclePriceBand: number | null
  price: string
  error: string
}
export type LoanParameter = {
  fee: string
  admin_fee: string
  rates: IRates
  future_rates?: IRates
  liquidation_discount: string
  loan_discount: string
}
export type BandBalance = Record<string, { stablecoin: string; collateral: string }>
export type LoanDetails = {
  loading: boolean
  oraclePriceBand: number | null
  parameters: LoanParameter
  balances: [string, string]
  basePrice: string | undefined
  bandsBalances: BandsBalancesData[]
  totalDebt: string
  totalCollateral: string
  totalStablecoin: string
  priceInfo: LoanPriceInfo
  capAndAvailable: { cap: string; available: string }
}
export type BandsBalancesData = {
  collateral: string
  collateralUsd: string
  isLiquidationBand: string
  isOraclePriceBand: boolean
  isNGrouped: boolean
  n: string
  p_up: string
  p_down: string
  pUpDownMedian: string
  stablecoin: string
  collateralStablecoinUsd: number
}
export type UserLoanDetails = {
  loading: boolean
  healthFull: string
  healthNotFull: string
  userBands: number[]
  userBandsRange: number | null
  userBandsPct: string
  userHealth: string
  userPrices: string[]
  userState: { collateral: string; stablecoin: string; debt: string }
  userBandsBalances: BandsBalancesData[]
  userIsCloseToLiquidation: boolean
  userLiquidationBand: number | null
  userLoss: { deposited_collateral: string; current_collateral_estimation: string; loss: string; loss_pct: string }
  userStatus: { label: string; colorKey: HealthColorKey; tooltip: string }
}
export type UserWalletBalances = {
  stablecoin: string
  collateral: string
  error: string
}
export type Theme = 'default' | 'dark' | 'chad'

export interface CollateralAlert extends TooltipProps {
  alertType: AlertType
  isCloseOnTooltipOnly?: boolean
  isDeprecated?: boolean
  address: string
  message: ReactNode
}

export type TitleKey = keyof typeof TITLE
export type FetchStatus = '' | 'loading' | 'success' | 'error'
export type TransactionStatus = '' | 'loading' | 'confirming' | 'error' | 'success'
