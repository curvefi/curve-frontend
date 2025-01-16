import { BrowserProvider } from 'ethers'
import type { INetworkName } from '@curvefi/stablecoin-api/lib/interfaces'
import type { LlammaTemplate } from '@curvefi/stablecoin-api/lib/llammas'
import type { Locale } from '@ui-kit/lib/i18n'
import type { NavigateFunction, Location, Params } from 'react-router'
import type { ReactNode } from 'react'
import type { TooltipProps } from '@/ui/Tooltip/types'
import type { WalletState } from '@web3-onboard/core'
import type { Eip1193Provider } from '@web3-onboard/core'
import type stablecoinApi from '@curvefi/stablecoin-api'
import type lendingApi from '@curvefi/lending-api'
import type { BaseConfig } from '@/ui/utils'

import curvejsApi from '@/lib/apiCrvusd'

import { TITLE } from '@/constants'

declare global {
  interface Window {
    clipboardData: any
    ethereum: Eip1193Provider
    exodus?: Eip1193Provider
    enkrypt?: { providers: { ethereum: Eip1193Provider } }
  }

  interface Array<T> {
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
  }

  type AlertType = 'info' | 'warning' | 'error' | 'danger'
  type ChainId = 1
  type Curve = typeof stablecoinApi & { chainId: ChainId }
  type LendApi = typeof lendingApi & { chainId: ChainId }
  type NetworkEnum = INetworkName
  type Provider = BrowserProvider

  type RFormType = 'loan' | 'deleverage' | 'collateral' | 'leverage' | ''
  type RouterParams = {
    rLocale: Locale | null
    rLocalePathname: string
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

  type PageProps = {
    pageLoaded: boolean
    routerParams: RouterParams
    curve: Curve | null
  }

  interface NetworkConfig extends BaseConfig {
    api: typeof curvejsApi
    isActiveNetwork: boolean // show network in UI's select dropdown list (ready for public)
    showInSelectNetwork: boolean // show network in UI
  }

  type PageWidthClassName = 'page-wide' | 'page-large' | 'page-medium' | 'page-small' | 'page-small-x' | 'page-small-xx'
  type Llamma = LlammaTemplate

  interface CollateralData {
    llamma: Llamma
    displayName: string
  }
  type CollateralDatasMapper = { [collateralId: string]: CollateralData }

  type CollateralDataCache = {
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
  type CollateralDataCacheMapper = { [collateralId: string]: CollateralDataCache }
  type CollateralDataCacheOrApi = CollateralDataCache | CollateralData

  type HeathColorKey = 'healthy' | 'close_to_liquidation' | 'soft_liquidation' | 'hard_liquidation' | ''

  type HealthMode = {
    percent: string
    colorKey: HeathColorKey
    icon: ReactNode | null
    message: string | null
    warningTitle: string
    warning: string
  }

  type LiqRange = {
    prices: string[]
    bands: [number, number]
  }

  type LoanExists = { loanExists: boolean; error: string }
  type LoanPriceInfo = {
    oraclePrice: string
    oraclePriceBand: number | null
    price: string
    error: string
  }

  type LoanParameter = {
    fee: string
    future_rate?: string
    admin_fee: string
    rate: string
    liquidation_discount: string
    loan_discount: string
  }

  type BandBalance = IDict<{ stablecoin: string; collateral: string }>

  type LoanDetails = {
    activeBand: number | null
    parameters: LoanParameter
    balances: [string, string]
    basePrice: string | undefined
    bandsBalances: BandBalance
    totalDebt: string
    totalCollateral: string
    totalStablecoin: string
    priceInfo: LoanPriceInfo
    capAndAvailable: { cap: string; available: string }
  }
  type LoanDetailsMapper = { [collateralId: string]: Partial<LoanDetails> }

  type BandsBalancesData = {
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

  type UserLoanDetails = {
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

  type UserWalletBalances = {
    stablecoin: string
    collateral: string
    error: string
  }

  type RouterProps = {
    params: Params
    location: Location
    navigate: NavigateFunction
  }

  type Theme = 'default' | 'dark' | 'chad'
  type UsdRate = { [tokenAddress: string]: string | number }
  type Wallet = WalletState

  interface CollateralAlert extends TooltipProps {
    alertType: AlertType
    isCloseOnTooltipOnly?: boolean // should only close if hover over tooltip
    isDeprecated?: boolean // display alert in form area
    address: string
    message: string | ReactNode
  }

  type TitleKey = keyof typeof TITLE
  type TitleMapper = Record<
    TITLE,
    { title: string | React.ReactNode; tooltip?: string | React.ReactNode; tooltipProps?: TooltipProps }
  >

  type FetchStatus = '' | 'loading' | 'success' | 'error'
  type TransactionStatus = '' | 'loading' | 'confirming' | 'error' | 'success'
}
