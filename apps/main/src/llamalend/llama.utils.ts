import { sortBy } from 'lodash'
import { type Address, Hex, zeroAddress } from 'viem'
import type { HealthColorKey, LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents as getMintUserMarketCollateralEvents } from '@curvefi/prices-api/crvusd'
import { getUserMarketCollateralEvents as getLendUserMarketCollateralEvents } from '@curvefi/prices-api/lending'
import { notFalsy, objectKeys } from '@curvefi/prices-api/objects.util'
import { requireLib, type Wallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { CRVUSD, type Decimal, formatNumber } from '@ui-kit/utils'
import { MarketNetBorrowAprTooltipContentProps } from './widgets/tooltips/MarketNetBorrowAprTooltipContent'

/**
 * Gets a Llama market (either a mint or lend market) by its ID.
 * Throws an error if no market is found with the given ID.
 */
export const getLlamaMarket = (id: string, lib = requireLib('llamaApi')): LlamaMarketTemplate =>
  id.startsWith('one-way') ? lib.getLendMarket(id) : lib.getMintMarket(id)

/**
 * Checks if a market supports leverage or not. A market supports leverage if:
 * - Lend Market and its `leverage` property has leverage
 * - Mint Market and either its `leverageZap` is not the zero address or its `leverageV2` property has leverage
 */
export const hasLeverage = (market: LlamaMarketTemplate) =>
  hasV1Leverage(market) || (market instanceof MintMarketTemplate && hasV2Leverage(market))

/**
 * Checks if leverage value (multiplier) can be calculated and displayed for this market.
 *
 * Returns true for:
 * - Lend markets with leverage support
 * - Mint markets with V2 leverage support (marketId >= 6)
 *
 * Note: Some older Mint markets (marketId < 6) support leverage operations (open/close positions)
 * but cannot calculate the leverage multiplier value.
 */
export const hasLeverageValue = (market: LlamaMarketTemplate) =>
  (market instanceof LendMarketTemplate && hasV1Leverage(market)) ||
  (market instanceof MintMarketTemplate && hasV2Leverage(market))

export const hasV1Leverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate ? market.leverage.hasLeverage() : market?.leverageZap !== zeroAddress

export const hasV2Leverage = (market: MintMarketTemplate) => !!market?.leverageV2.hasLeverage()

export const hasV1Deleverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate ? market.leverage.hasLeverage() : market?.deleverageZap !== zeroAddress

// hasV2Leverage works for deleverage as well
export const hasDeleverage = (market: LlamaMarketTemplate) =>
  hasV1Deleverage(market) || (market instanceof MintMarketTemplate && hasV2Leverage(market))

export const canRepayFromStateCollateral = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate ? hasDeleverage(market) : hasLeverage(market)

export const canRepayFromUserCollateral = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate ? hasV2Leverage(market) : hasLeverage(market)

export const hasVault = (market: LlamaMarketTemplate) => market instanceof LendMarketTemplate && 'vault' in market

export const hasGauge = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate && market.addresses.gauge !== zeroAddress

const getBorrowSymbol = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate ? CRVUSD.symbol : market.borrowed_token.symbol

const getCollateralSymbol = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate ? market.collateralSymbol : market.collateral_token.symbol

export const formatTokenAmounts = (
  market: LlamaMarketTemplate,
  { userBorrowed, userCollateral }: { userBorrowed?: Decimal; userCollateral?: Decimal },
) =>
  notFalsy(
    userBorrowed && +userBorrowed && `${formatNumber(userBorrowed, { abbreviate: false })} ${getBorrowSymbol(market)}`,
    userCollateral &&
      +userCollateral &&
      `${formatNumber(userCollateral, { abbreviate: false })} ${getCollateralSymbol(market)}`,
  ).join(', ')

export const getTokens = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          symbol: market.collateralSymbol,
          address: market.collateral as Address,
          decimals: market.collateralDecimals,
        },
        borrowToken: CRVUSD,
      }
    : {
        collateralToken: {
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address as Address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address as Address,
          decimals: market.borrowed_token.decimals,
        },
      }

/**
 * Calculates the loan-to-value ratio of a market.
 * @param debtAmount - The amount of debt in the market.
 * @param collateralAmount - The amount of deposited collateral.
 * @param collateralBorrowTokenAmount - The amount of collateral that has been converted into the borrow token during soft-liquidation.
 * @param borrowTokenUsdRate - The USD rate of the borrow token.
 * @param collateralTokenUsdRate - The USD rate of the collateral token.
 * @returns The loan-to-value ratio of the market.
 */
export const calculateLtv = (
  debtAmount: number,
  collateralAmount: number,
  collateralBorrowTokenAmount: number,
  borrowTokenUsdRate: number | null | undefined,
  collateralTokenUsdRate: number | null | undefined,
) => {
  const collateralValue =
    collateralAmount * (collateralTokenUsdRate ?? 0) + collateralBorrowTokenAmount * (borrowTokenUsdRate ?? 0)
  const debtValue = debtAmount * (borrowTokenUsdRate ?? 0)
  if (collateralValue === 0 || debtValue === 0) return 0
  return (debtValue / collateralValue) * 100
}

/**
 * Sends a new transaction hash to the backend to update user events.
 * Note that the backend data will not be directly updated, but this will trigger a background refresh.
 * Therefore, we don't invalidate the `userLendCollateralEvents` query immediately after calling this function.
 */
export const updateUserEventsApi = (
  wallet: Wallet,
  { id: networkId }: { id: LlamaNetworkId },
  market: LlamaMarketTemplate,
  txHash: string,
) => {
  const [address, updateEvents] =
    market instanceof LendMarketTemplate
      ? [market.addresses.controller, getLendUserMarketCollateralEvents]
      : [market.controller, getMintUserMarketCollateralEvents]
  void updateEvents(wallet.address, networkId as Chain, address as Address, txHash as Hex)
}

/**
 * It’s possible that when a user briefly enters and then exits soft liquidation,
 * one or more bands may be left with a tiny amount of crvUSD (dust). There is a
 * dust-sweeping bot that cleans this up, but there can be a delay before those
 * remnants are collected.
 *
 * The current front-end check is rudimentary and can sometimes conclude that a
 * user is still in soft liquidation even though their overall health is healthy,
 * which is confusing.
 *
 * As a pragmatic, short-term mitigation to reduce false positives, we only mark
 * loans as being in soft liquidation when the crvUSD balance of a band exceeds
 * a small threshold. This prevents trivial dust amounts from triggering the UI.
 *
 * If somebody wants to tackle this properly, they can find the bot code here:
 * https://github.com/curvefi/dust-cleaner-bot/blob/0795b2fa/app/services/controller.py#L90
 */
const SOFT_LIQUIDATION_DUST_THRESHOLD = 0.1

/**
 * healthNotFull is needed here because:
 * User full health can be > 0
 * But user is at risk of liquidation if not full < 0
 */
export function getLiquidationStatus(
  healthNotFull: string,
  userIsCloseToLiquidation: boolean,
  userStateStablecoin: string,
) {
  const userStatus: { label: string; colorKey: HealthColorKey; tooltip: string } = {
    label: 'Healthy',
    colorKey: 'healthy',
    tooltip: '',
  }

  if (+healthNotFull < 0) {
    userStatus.label = 'Hard liquidatable'
    userStatus.colorKey = 'hard_liquidation'
    userStatus.tooltip =
      'Hard liquidation is like a usual liquidation, which can happen only if you experience significant losses in soft liquidation so that you get below 0 health.'
  } else if (+userStateStablecoin > SOFT_LIQUIDATION_DUST_THRESHOLD) {
    userStatus.label = 'Soft liquidation'
    userStatus.colorKey = 'soft_liquidation'
    userStatus.tooltip =
      'Soft liquidation is the initial process of collateral being converted into stablecoin, you may experience some degree of loss.'
  } else if (userIsCloseToLiquidation) {
    userStatus.label = 'Close to liquidation'
    userStatus.colorKey = 'close_to_liquidation'
  }

  return userStatus
}

export function getIsUserCloseToLiquidation(
  userFirstBand: number,
  userLiquidationBand: number | null,
  oraclePriceBand: number | null | undefined,
) {
  if (userLiquidationBand !== null && typeof oraclePriceBand !== 'number') {
    return false
  } else if (typeof oraclePriceBand === 'number') {
    return userFirstBand <= oraclePriceBand + 2
  }
  return false
}

export function reverseBands(bands: [number, number] | number[]) {
  return [bands[1], bands[0]] as [number, number]
}

// There's a slight difference in types (borrowed vs stablecoin) that I didn't want to touch at the risk of breaking things;
// I only want to move code, not change. At least they're neatly in the same place now.

export function sortBandsLend(bandsBalances: { [index: number]: { borrowed: string; collateral: string } }) {
  const sortedKeys = sortBy(objectKeys(bandsBalances), (k) => +k)
  const bandsBalancesArr: { borrowed: string; collateral: string; band: number }[] = []
  for (const k of sortedKeys) {
    bandsBalancesArr.push({ ...bandsBalances[k], band: k })
  }
  return { bandsBalancesArr, bandsBalances }
}

export function sortBandsMint(bandBalances: { [key: string]: { stablecoin: string; collateral: string } }) {
  const sortedKeys = sortBy(objectKeys(bandBalances).map((k) => +k))
  const bandBalancesArr: { stablecoin: string; collateral: string; band: string }[] = []
  for (const k of sortedKeys) {
    bandBalancesArr.push({ ...bandBalances[k], band: `${k}` })
  }
  return { bandBalancesArr, bandBalances }
}

/** Tooltip title for borrow APR. The title should be "Net borrow APR" if there are extra rewards or rebasing yield, otherwise "Borrow APR". */
export const getBorrowRateTooltipTitle = ({
  totalBorrowApr,
  extraRewards,
  rebasingYieldApr,
}: Pick<MarketNetBorrowAprTooltipContentProps, 'totalBorrowApr' | 'extraRewards' | 'rebasingYieldApr'>) =>
  totalBorrowApr != null && (extraRewards.length || rebasingYieldApr != null) ? t`Net borrow APR` : t`Borrow APR`
