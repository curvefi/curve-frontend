import type { I1inchRoute, IChainId, INetworkName } from '@curvefi/lending-api/lib/interfaces'
import type { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import type { LocaleOption } from '@/lib/i18n'
import type { Location, NavigateFunction, Params } from 'react-router'
import type { ReactNode } from 'react'
import React from 'react'
import type { Eip1193Provider, WalletState } from '@web3-onboard/core'
import type lendingApi from '@curvefi/lending-api'
import type { TooltipProps } from '@/ui/Tooltip/types'

import { TITLE } from '@/constants'
import type { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'

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
  type ChainId = IChainId
  type Api = typeof lendingApi & { chainId: ChainId }
  type NetworkEnum = INetworkName
  type Provider = ethers.Provider.BrowserProvider
  type MarketListType = 'borrow' | 'supply'

  // number[]: [L2GasUsed, L1GasUsed]
  // number  : L1gasUsed
  type EstimatedGas = number | number[] | null

  // NETWORK PROPERTIES
  interface NetworkConfig {
    blocknativeSupport: boolean
    gasL2: boolean
    gasPricesUnit: string
    gasPricesUrl: string
    gasPricesDefault: number
    hex: string
    icon: FunctionComponent<SVGProps<SVGSVGElement>>
    id: NetworkEnum
    imageBaseUrl: string
    integrations: {
      imageBaseurl: string
      listUrl: string
      tagsUrl: string
    }
    rewards: {
      baseUrl: string
      imageBaseUrl: string
      campaignsUrl: string
      tagsUrl: string
    }
    isActiveNetwork: boolean // show UI for this network default true
    name: string
    networkId: ChainId
    orgUIPath: string
    rpcUrlConnectWallet: string
    rpcUrl: string
    smallMarketAmount: number
    scanAddressPath: (hash: string) => string
    scanTxPath: (hash: string) => string
    scanTokenPath: (hash: string) => string
    showInSelectNetwork: boolean
    symbol: string

    // market list page properties
    hideMarketsInUI: { [owmId: string]: boolean }
    marketListFilter: string[]
    marketListFilterType: string[]
    pricesData: boolean
    marketListShowOnlyInSmallMarkets: { [marketId: string]: boolean }
  }

  // API RESPONSE
  type MaxRecvLeverageResp = {
    maxDebt: string
    maxTotalCollateral: string
    userCollateral: string
    collateralFromUserBorrowed: string
    collateralFromMaxDebt: string
    avgPrice: string
  }

  type LiqRangeResp = {
    n: number
    collateral: string
    debt: string
    maxRecv: string | null
    maxRecvError: string
    prices: string[]
    bands: [number, number]
  }

  type DetailInfoResp = {
    healthFull: string
    healthNotFull: string
    futureRates: FutureRates | null
    prices: string[]
    bands: [number, number]
  }

  type DetailInfoLeverageResp = DetailInfoResp & {
    priceImpact: string
    isHighPriceImpact: boolean
  }

  type ExpectedCollateral = {
    totalCollateral: string
    userCollateral: string
    collateralFromUserBorrowed: string
    collateralFromDebt: string
    leverage: string
    avgPrice: string
  }

  type ExpectedBorrowed = {
    totalBorrowed: string
    borrowedFromStateCollateral: string
    borrowedFromUserCollateral: string
    userBorrowed: string
    avgPrice: string
  }

  type Routes = I1inchRoute[]

  // PAGE PROPERTIES
  type RFormType = 'loan' | 'collateral' | 'deposit' | 'mint' | 'redeem' | 'withdraw' | ''
  type RouterParams = {
    rLocale: Locale | null
    rLocalePathname: string
    rChainId: ChainId
    rNetwork: NetworkEnum
    rNetworkIdx: number
    rSubdirectory: string
    rSubdirectoryUseDefault: boolean
    rOwmId: string
    rFormType: RFormType
    redirectPathname: string
    restFullPathname: string
  }

  type PageProps = {
    pageLoaded: boolean
    routerParams: RouterParams
    api: Api | null
  }

  type PageWidthClassName = 'page-wide' | 'page-large' | 'page-medium' | 'page-small' | 'page-small-x' | 'page-small-xx'

  type PageContentProps = {
    params: Params
    rChainId: ChainId
    rOwmId: string
    rFormType: string | null
    rSubdirectory: string
    userActiveKey: string
    isLoaded: boolean
    api: Api | null
    market: OneWayMarketTemplate | undefined
    titleMapper: TitleMapper
  }

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

  // Market Stats
  type MarketStatParameters = {
    parameters: {
      fee: string
      admin_fee: string
      liquidation_discount: string
      loan_discount: string
      base_price: string
      A: string
    } | null
    error: string
  }
  type MarketsStatsParametersMapper = { [owmId: string]: MarketStatParameters }

  type BandsBalances = { [band: number]: { borrowed: string; collateral: string } }
  type BandsBalancesArr = { borrowed: string; collateral: string; band: number }[]
  type ParsedBandsBalances = {
    borrowed: string
    collateral: string
    collateralUsd: string
    collateralBorrowedUsd: number
    isLiquidationBand: string
    isOraclePriceBand: boolean
    isNGrouped: boolean
    n: number | string
    p_up: any
    p_down: any
    pUpDownMedian: string
  }

  type MarketStatBands = {
    bands: {
      balances: string[]
      maxMinBands: number[]
      activeBand: number
      liquidationBand: number | null
      bandBalances: { borrowed: string; collateral: string } | null
      bandsBalances: ParsedBandsBalances[]
    } | null
    error: string
  }
  type MarketsStatsBandsMapper = { [owmId: string]: MarketStatBands }

  type MarketStatTotals = { totalDebt: string; error: string }
  type MarketsStatsTotalsMapper = { [owmId: string]: MarketStatTotals }

  type MarketStatAmmBalances = { borrowed: string; collateral: string; error: string }
  type MarketsStatsAMMBalancesMapper = { [owmId: string]: MarketStatAmmBalances }

  type MarketStatCapAndAvailable = { cap: string; available: string; error: string }
  type MarketsStatsCapAndAvailableMapper = { [owmId: string]: MarketStatCapAndAvailable }

  type MarketMaxLeverage = { maxLeverage: string; error: string }
  type MarketsMaxLeverageMapper = { [owmId: string]: MarketMaxLeverage }

  type MarketPrices = {
    prices: {
      oraclePrice: string
      oraclePriceBand: number | null
      price: string
      basePrice: string
    } | null
    error: string
  }
  type MarketsPricesMapper = { [owmId: string]: MarketPrices }

  type MarketRates = {
    rates: {
      borrowApr: string
      lendApr: string
      borrowApy: string
      lendApy: string
    } | null
    error: string
  }
  type MarketsRatesMapper = { [owmId: string]: MartetRates }

  type MarketTotalLiquidity = {
    totalLiquidity: string
    error: string
  }
  type MarketsTotalLiquidityMapper = { [owmId: string]: MarketTotalLiquidity }

  type MarketTotalCollateralValue = {
    total: number | null
    tooltipContent: { label: string; value: string }[]
    error: string
  }
  type MarketsTotalCollateralValueMapper = { [owmId: string]: MarketTotalCollateralValue }

  type RewardOther = {
    apy: number
    decimals?: number
    gaugeAddress: string
    name?: string
    symbol: string
    tokenAddress: string
    tokenPrice?: number
  }

  export type RewardCrv = number

  type MarketRewards = {
    rewards: {
      other: RewardOther[]
      crv: RewardCrv[]
    } | null
    error: string
  }

  type MarketsRewardsMapper = { [owmId: string]: MarketRewards }

  type MarketClaimable = {
    claimable: {
      crv: string
      rewards: { token: string; symbol: string; amount: string }[]
    } | null
    error: string
  }
  type MarketsClaimableMapper = { [owmId: string]: MarketClaimable }

  // USER PROPERTIES
  type UserLoss = {
    deposited_collateral: string
    current_collateral_estimation: string
    loss: string
    loss_pct: string
  }

  type UserLoanHealth = { healthFull: string; healthNotFull: string; error: string }
  type UsersLoansHealthsMapper = { [userActiveKey: string]: UserLoanHealth }

  type UserLoanState = { collateral: string; borrowed: string; debt: string; N: string; error: string }
  type UsersLoansStatesMapper = { [userActiveKey: string]: UserLoanState }

  type UserLoanDetails = {
    details: {
      health: string
      healthFull: string
      healthNotFull: string
      bands: number[]
      bandsBalances: BandsBalancesData[]
      bandsPct: string
      isCloseToLiquidation: boolean
      loss: UserLoss
      prices: string[]
      range: number | null
      state: { collateral: string; borrowed: string; debt: string; N: string }
      status: { label: string; colorKey: HeathColorKey; tooltip: string }
    } | null
    error: string
  }
  type UsersLoansDetailsMapper = { [userActiveKey: string]: UserLoanDetails }

  type UserLoanExists = { loanExists: boolean; error: string }
  type UsersLoansExistsMapper = { [userActiveKey: string]: UserLoanExists }

  type UserMarketBalances = {
    collateral: string
    borrowed: string
    vaultShares: string
    vaultSharesConverted: string
    gauge: string
    error: string
  }
  type UsersMarketsBalancesMapper = { [userActiveKey: string]: UserMarketBalances }

  type FutureRates = {
    borrowApr: string
    lendApr: string
    borrowApy: string
    lendApy: string
  }

  // MISC
  type Order = 'asc' | 'desc'

  type RouterProps = {
    params: Params
    location: Location
    navigate: NavigateFunction
  }

  type Wallet = WalletState
  type MarketDetailsView = 'user' | 'market' | ''
  type TitleKey = keyof typeof TITLE
  type TitleMapper = Record<
    TITLE,
    { title: string | React.ReactNode; tooltip?: string | React.ReactNode; tooltipProps?: TooltipProps }
  >
}
