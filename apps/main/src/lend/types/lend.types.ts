import { ethers } from 'ethers'
import type { ReactNode } from 'react'
import { TITLE } from '@/lend/constants'
import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BaseConfig } from '@ui/utils'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'

export type { Wallet } from '@ui-kit/features/connect-wallet'

export type Api = LlamaApi
export type AlertType = 'info' | 'warning' | 'error' | 'danger'
export type ChainId = IChainId
export type NetworkEnum = INetworkName
export type Provider = ethers.BrowserProvider
export type MarketListType = 'borrow' | 'supply'
export type EstimatedGas = number | number[] | null
export type OneWayMarketTemplate = LendMarketTemplate // todo: use LendMarketTemplate consistently

export type NetworkUrlParams = { network: NetworkEnum }
export type MarketUrlParams = NetworkUrlParams & { market: string; formType?: RFormType }
export type UrlParams = NetworkUrlParams & Partial<MarketUrlParams>

export interface NetworkConfig<TId extends string = string, TChainId extends number = number>
  extends BaseConfig<TId, TChainId> {
  smallMarketAmount: number
  isActiveNetwork: boolean
  showInSelectNetwork: boolean
  hideMarketsInUI: { [owmId: string]: boolean }
  marketListFilter: string[]
  marketListFilterType: string[]
  pricesData: boolean
  marketListShowOnlyInSmallMarkets: { [marketId: string]: boolean }
}

export type MaxRecvLeverageResp = {
  maxDebt: string
  maxTotalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromMaxDebt: string
  avgPrice: string
}
export type LiqRangeResp = {
  n: number
  collateral: string
  debt: string
  maxRecv: string | null
  maxRecvError: string
  prices: string[]
  bands: [number, number]
}
export type DetailInfoResp = {
  healthFull: string
  healthNotFull: string
  futureRates: FutureRates | null
  prices: string[]
  bands: [number, number]
}
export type DetailInfoLeverageResp = DetailInfoResp & {
  priceImpact: string
  isHighPriceImpact: boolean
}
export type ExpectedCollateral = {
  totalCollateral: string
  userCollateral: string
  collateralFromUserBorrowed: string
  collateralFromDebt: string
  leverage: string
  avgPrice: string
}
export type ExpectedBorrowed = {
  totalBorrowed: string
  borrowedFromStateCollateral: string
  borrowedFromUserCollateral: string
  userBorrowed: string
  avgPrice: string
}
export type RFormType = 'loan' | 'collateral' | 'deposit' | 'mint' | 'redeem' | 'withdraw' | ''

export type PageContentProps = {
  params: UrlParams
  rChainId: ChainId
  rOwmId: string
  rFormType: string | null
  userActiveKey: string
  isLoaded: boolean
  api: LlamaApi | null
  market: OneWayMarketTemplate | undefined
  titleMapper: TitleMapper
}
export type HealthColorKey = 'healthy' | 'close_to_liquidation' | 'soft_liquidation' | 'hard_liquidation' | ''
export type HealthMode = {
  percent: string
  colorKey: HealthColorKey
  icon: ReactNode
  message: string | null
  warningTitle: string
  warning: string
}
export type LiqRange = {
  prices: string[]
  bands: [number, number]
}
export type MarketStatParameters = {
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
export type MarketsStatsParametersMapper = { [owmId: string]: MarketStatParameters }
export type BandsBalances = { [band: number]: { borrowed: string; collateral: string } }
export type BandsBalancesArr = { borrowed: string; collateral: string; band: number }[]
export type ParsedBandsBalances = {
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
export type MarketStatBands = {
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
export type MarketsStatsBandsMapper = { [owmId: string]: MarketStatBands }
export type MarketStatTotals = { totalDebt: string; error: string }
export type MarketsStatsTotalsMapper = { [owmId: string]: MarketStatTotals }
export type MarketStatAmmBalances = { borrowed: string; collateral: string; error: string }
export type MarketsStatsAMMBalancesMapper = { [owmId: string]: MarketStatAmmBalances }
export type MarketStatCapAndAvailable = { cap: string; available: string; error: string }
export type MarketsStatsCapAndAvailableMapper = { [owmId: string]: MarketStatCapAndAvailable }
export type MarketMaxLeverage = { maxLeverage: string; error: string }
export type MarketsMaxLeverageMapper = { [owmId: string]: MarketMaxLeverage }
export type MarketPrices = {
  prices: {
    oraclePrice: string
    oraclePriceBand: number | null
    price: string
    basePrice: string
  } | null
  error: string
}
export type MarketsPricesMapper = { [owmId: string]: MarketPrices }
export type MarketRates = {
  rates: {
    borrowApr: string
    lendApr: string
    borrowApy: string
    lendApy: string
  } | null
  error: string
}
export type MarketsRatesMapper = { [owmId: string]: MarketRates }
export type MarketTotalLiquidity = {
  totalLiquidity: string
  error: string
}
export type MarketsTotalLiquidityMapper = { [owmId: string]: MarketTotalLiquidity }
export type MarketTotalCollateralValue = {
  total: number | null
  tooltipContent: { label: string; value: string }[]
  error: string
}
export type MarketsTotalCollateralValueMapper = { [owmId: string]: MarketTotalCollateralValue }
export type RewardOther = {
  apy: number
  decimals?: number
  gaugeAddress: string
  name?: string
  symbol: string
  tokenAddress: string
  tokenPrice?: number
}
export type RewardCrv = number
export type MarketRewards = {
  rewards: {
    other: RewardOther[]
    crv: RewardCrv[]
  } | null
  error: string
}
export type MarketsRewardsMapper = { [owmId: string]: MarketRewards }
export type MarketClaimable = {
  claimable: {
    crv: string
    rewards: { token: string; symbol: string; amount: string }[]
  } | null
  error: string
}

export type UserLoss = {
  deposited_collateral: string
  current_collateral_estimation: string
  loss: string
  loss_pct: string
}
export type UserLoanHealth = { healthFull: string; healthNotFull: string; error: string }
export type UsersLoansHealthsMapper = { [userActiveKey: string]: UserLoanHealth }
export type UserLoanState = { collateral: string; borrowed: string; debt: string; N: string; error: string }
export type UsersLoansStatesMapper = { [userActiveKey: string]: UserLoanState }
export type UserLoanDetails = {
  details: {
    health: string
    healthFull: string
    healthNotFull: string
    bands: number[]
    bandsBalances: ParsedBandsBalances[]
    bandsPct: string
    isCloseToLiquidation: boolean
    loss?: UserLoss
    prices: string[]
    range: number | null
    state: { collateral: string; borrowed: string; debt: string; N: string }
    status: { label: string; colorKey: HealthColorKey; tooltip: string }
    leverage: string
    pnl: Record<string, string>
  } | null
  error: string
}
export type UsersLoansDetailsMapper = { [userActiveKey: string]: UserLoanDetails }
export type UserLoanExists = { loanExists: boolean; error: string }
export type UsersLoansExistsMapper = { [userActiveKey: string]: UserLoanExists }
export type UserMarketBalances = {
  collateral: string
  borrowed: string
  vaultShares: string
  vaultSharesConverted: string
  gauge: string
  error: string
}
export type UsersMarketsBalancesMapper = { [userActiveKey: string]: UserMarketBalances }
export type FutureRates = {
  borrowApr: string
  lendApr: string
  borrowApy: string
  lendApy: string
}
export type Order = 'asc' | 'desc'
export type MarketDetailsView = 'user' | 'market' | ''
export type TitleKey = keyof typeof TITLE
export type TitleMapper = Record<TITLE, { title: ReactNode; tooltip?: ReactNode; tooltipProps?: TooltipProps }>
