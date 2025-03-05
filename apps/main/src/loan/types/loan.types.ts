import { BrowserProvider } from 'ethers'
import type { INetworkName } from '@curvefi/stablecoin-api/lib/interfaces'
import type { LlammaTemplate } from '@curvefi/stablecoin-api/lib/llammas'
import type { ReactNode } from 'react'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { WalletState } from '@web3-onboard/core'
import type stablecoinApi from '@curvefi/stablecoin-api'
import type lendingApi from '@curvefi/lending-api'
import type { BaseConfig } from '@ui/utils'
import curvejsApi from '@/loan/lib/apiCrvusd'
import { TITLE } from '@/loan/constants'

export type NetworkUrlParams = { network: INetworkName }
type CollateralExtraParams = { collateralId: string; formType?: string[] }
export type CollateralUrlParams = NetworkUrlParams & CollateralExtraParams
export type UrlParams = Partial<CollateralUrlParams>

export type AlertType = 'info' | 'warning' | 'error' | 'danger'
export type ChainId = 1
export type Curve = typeof stablecoinApi & { chainId: ChainId }
export type LendApi = typeof lendingApi & { chainId: ChainId }
export type NetworkEnum = INetworkName
export type Provider = BrowserProvider
export type RFormType = 'loan' | 'deleverage' | 'collateral' | 'leverage' | ''
export type RouterParams = {
  rChainId: ChainId
  rNetwork: NetworkEnum
  rNetworkIdx: number
  rSubdirectory: string
  rSubdirectoryUseDefault: boolean
  rCollateralId: string
  rFormType: RFormType
  redirectPathname: string
  restFullPathname: string
}
export type PageProps = {
  pageLoaded: boolean
  routerParams: RouterParams
  curve: Curve | null
}

export interface NetworkConfig extends BaseConfig {
  api: typeof curvejsApi
  isActiveNetwork: boolean
  showInSelectNetwork: boolean
}

export type PageWidthClassName =
  | 'page-wide'
  | 'page-large'
  | 'page-medium'
  | 'page-small'
  | 'page-small-x'
  | 'page-small-xx'
export type Llamma = LlammaTemplate

export interface CollateralData {
  llamma: Llamma
  displayName: string
}

export type CollateralDatasMapper = { [collateralId: string]: CollateralData }
export type CollateralDataCache = {
  llamma: {
    id: string
    address: string
    controller: string
    collateral: string
    collateralSymbol: string
    coins: string[]
    coinAddresses: string[]
  }
  displayName: string
}
export type CollateralDataCacheMapper = { [collateralId: string]: CollateralDataCache }
export type CollateralDataCacheOrApi = CollateralDataCache | CollateralData
export type HeathColorKey = 'healthy' | 'close_to_liquidation' | 'soft_liquidation' | 'hard_liquidation' | ''
export type HealthMode = {
  percent: string
  colorKey: HeathColorKey
  icon: ReactNode
  message: string | null
  warningTitle: string
  warning: string
}
export type LiqRange = {
  prices: string[]
  bands: [number, number]
}
export type LoanExists = { loanExists: boolean; error: string }
export type LoanPriceInfo = {
  oraclePrice: string
  oraclePriceBand: number | null
  price: string
  error: string
}
export type LoanParameter = {
  fee: string
  future_rate?: string
  admin_fee: string
  rate: string
  liquidation_discount: string
  loan_discount: string
}
export type BandBalance = Record<string, { stablecoin: string; collateral: string }>
export type LoanDetails = {
  activeBand: number | null
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
export type LoanDetailsMapper = { [collateralId: string]: Partial<LoanDetails> }
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
  userStatus: { label: string; colorKey: HeathColorKey; tooltip: string }
}
export type UserWalletBalances = {
  stablecoin: string
  collateral: string
  error: string
}
export type Theme = 'default' | 'dark' | 'chad'
export type UsdRate = { [tokenAddress: string]: string | number }
export type Wallet = WalletState

export interface CollateralAlert extends TooltipProps {
  alertType: AlertType
  isCloseOnTooltipOnly?: boolean
  isDeprecated?: boolean
  address: string
  message: ReactNode
}

export type TitleKey = keyof typeof TITLE
export type TitleMapper = Record<TITLE, { title: ReactNode; tooltip?: ReactNode; tooltipProps?: TooltipProps }>
export type FetchStatus = '' | 'loading' | 'success' | 'error'
export type TransactionStatus = '' | 'loading' | 'confirming' | 'error' | 'success'
