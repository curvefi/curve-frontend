import { ethers } from 'ethers'
import type { ReactNode } from 'react'
import { TITLE } from '@/lend/constants'
import type { HealthColorKey } from '@/llamalend/llamalend.types'
import type { IChainId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Address } from '@curvefi/prices-api'
import type { TooltipProps } from '@ui/Tooltip/types'
import type { BaseConfig } from '@ui/utils'
import type { LlamaApi } from '@ui-kit/features/connect-wallet'

export type { Wallet } from '@ui-kit/features/connect-wallet'

export type Api = LlamaApi
export type AlertType = 'info' | 'warning' | 'error' | 'danger'
export type ChainId = IChainId
export type NetworkEnum = INetworkName
export type Provider = ethers.BrowserProvider
export type EstimatedGas = number | number[] | null
export type OneWayMarketTemplate = LendMarketTemplate // todo: use LendMarketTemplate consistently

export type NetworkUrlParams = { network: NetworkEnum }
export type MarketUrlParams = NetworkUrlParams & { market: string }
export type UrlParams = NetworkUrlParams & Partial<MarketUrlParams>

export interface NetworkConfig<TId extends string = string, TChainId extends number = number> extends BaseConfig<
  TId,
  TChainId
> {
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

export type PageContentProps<T = UrlParams> = {
  params: T
  rChainId: ChainId
  rOwmId: string
  userAddress: Address
  userActiveKey: string
  isLoaded: boolean
  api: LlamaApi | null
  market: OneWayMarketTemplate | undefined
  titleMapper: TitleMapper
}
export type LiqRange = {
  prices: string[]
  bands: [number, number]
}
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
  p_up: string
  p_down: string
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
export type UserLoanState = { collateral: string; borrowed: string; debt: string; N: string; error: string }
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
  } | null
  error: string
}
export type UsersLoansDetailsMapper = { [userActiveKey: string]: UserLoanDetails }
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
export type MarketDetailsView = 'user' | 'market' | ''
export type TitleMapper = Record<TITLE, { title: ReactNode; tooltip?: ReactNode; tooltipProps?: TooltipProps }>

export enum FormWarning {
  // loan deleverage
  FullRepaymentOnly = 'warning-full-repayment-only',

  IsPayoffAmount = 'warning-is-payoff-amount',
  NotInLiquidationMode = 'warning-not-in-liquidation-mode',
  NotEnoughCrvusd = 'warning-not-enough-crvusd',
}

export enum FormError {
  // vault

  // repay
  FullRepaymentRequired = 'error-full-repayment-required',

  // all
  API = 'error-api',
  ExistingLoan = 'error-existing-loan',
  EstGasApproval = 'error-est-gas-approval',
  InvalidProvider = 'error-invalid-provider',
  WalletBalances = 'error-wallet-balances',
  StepApprove = 'error-step-approve',
  LiquidationMode = 'error-liquidation-mode',
  TotalSupply = 'error-total-supply',
}

export type FormStatus = {
  isApproved: boolean
  isApprovedCompleted: boolean
  isComplete: boolean
  isInProgress: boolean
  error: string
  stepError: string
}
