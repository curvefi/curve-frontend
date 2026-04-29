import { BigNumber } from 'bignumber.js'
import { sortBy } from 'lodash'
import { zeroAddress } from 'viem'
import type { HealthColorKey, LlamaMarketTemplate, UserPositionStatus } from '@/llamalend/llamalend.types'
import type { UserState } from '@/llamalend/queries/user'
import { MarketNetBorrowAprTooltipContentProps } from '@/llamalend/widgets/tooltips'
import type { INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents as getMintUserMarketCollateralEvents } from '@curvefi/prices-api/crvusd'
import { getUserMarketCollateralEvents as getLendUserMarketCollateralEvents } from '@curvefi/prices-api/lending'
import type { BadDebt } from '@curvefi/prices-api/liquidations'
import { type Address, Hex } from '@primitives/address.utils'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { notFalsy, objectKeys } from '@primitives/objects.utils'
import { getLib, requireLib, type Wallet } from '@ui-kit/features/connect-wallet'
import { isZapV2Enabled } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { CRVUSD, decimalMinus, decimalSum, formatNumber } from '@ui-kit/utils'

/**
 * Gets a Llama market (either a mint or lend market) by its ID.
 * Throws an error if no market is found with the given ID.
 */
export const getLlamaMarket = (id: string | LlamaMarketTemplate, lib = requireLib('llamaApi')): LlamaMarketTemplate =>
  typeof id === 'string' ? (id.startsWith('one-way') ? lib.getLendMarket(id) : lib.getMintMarket(id)) : id

/**
 * Helper to retrieve the llama market after initialization, avoiding crashing the components using it.
 * We use this helper during query validation since we cannot crash the validation suite outside `test()`
 */
export const tryGetLlamaMarket = (marketId: LlamaMarketTemplate | string | null | undefined) => {
  if (typeof marketId === 'object') return marketId
  const lib = getLib('llamaApi') // retrieve lib separately to avoid crashing the whole app when uninitialized
  return marketId && lib && getLlamaMarket(marketId, lib)
}

const isLendV2Market = (market: LlamaMarketTemplate) => market instanceof LendMarketTemplate && market.version === 'v2'

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
  market instanceof LendMarketTemplate
    ? !isLendV2Market(market) && market.leverage.hasLeverage()
    : market?.leverageZap !== zeroAddress

export const hasV2Leverage = (market: MintMarketTemplate) => !isLendV2Market(market) && market?.leverageV2.hasLeverage()

const hasV1Deleverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate ? hasV1Leverage(market) : market?.deleverageZap !== zeroAddress

// hasV2Leverage works for deleverage as well
export const hasDeleverage = (market: LlamaMarketTemplate) =>
  hasV1Deleverage(market) || (market instanceof MintMarketTemplate && hasV2Leverage(market))

/**
 * Check if an open position is a leveraged position, using the leverage value.
 * prevLeverage is 0 when the position didn't exist before, future leverage is 0 on full repayment.
 * (prev)Leverage is >0 and <1 when the position has been leveraged in the past or went through soft liquidation.
 * (prev)Leverage is 1 when the position is not leveraged at all (simple borrowing, no leverage).
 * (prev)Leverage is > 1 when the position is leveraged.
 **/
export const isPositionLeveraged = (leverage: Amount | undefined | null) =>
  leverage != null && !BigNumber(leverage).isZero() && !BigNumber(leverage).isEqualTo(1)

export const canRepayFromStateCollateral = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate ? hasDeleverage(market) : hasLeverage(market)

export const canRepayFromUserCollateral = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate ? hasV2Leverage(market) : hasLeverage(market)

export const hasVault = (market: LlamaMarketTemplate) => market instanceof LendMarketTemplate && 'vault' in market

export const hasZapV2 = (market: LlamaMarketTemplate) =>
  isZapV2Enabled() && market instanceof LendMarketTemplate && market.leverageZapV2.hasLeverage()

export const isRouterRequired = (
  type: 'zapV2' | 'V0' | 'V1' | 'V2' | 'deleverage' | 'unleveragedMint' | 'unleveragedLend' | 'unleveraged',
) => type == 'zapV2'

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

export function getControllerAddress(market: LlamaMarketTemplate): Address
export function getControllerAddress(market: null | undefined): undefined
export function getControllerAddress(market: LlamaMarketTemplate | null | undefined): Address | undefined
export function getControllerAddress(market: LlamaMarketTemplate | null | undefined): Address | undefined {
  return (market instanceof LendMarketTemplate ? market?.addresses?.controller : market?.controller) as
    | Address
    | undefined
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
 * Returns the minimum crvUSD stablecoin balance in a user’s AMM bands that must be
 * exceeded before the position is considered to be in soft liquidation.
 *
 * When a user briefly enters and then exits soft liquidation, one or more bands may
 * be left with a tiny amount of crvUSD (dust). There is a dust-sweeping bot that
 * cleans this up, but there can be a delay before those remnants are collected.
 * Without a threshold this dust would cause false-positive soft-liquidation alerts.
 *
 * However, the threshold must be skipped when the oracle price is within or near the
 * user’s bands (`userIsCloseToLiquidation=true`), because in that case even a tiny
 * stablecoin balance is genuine soft-liquidation activity, not leftover dust. Dust
 * only exists when the oracle has moved *far away* from the bands, which is exactly
 * the situation where `userIsCloseToLiquidation` is false.
 *
 * If somebody wants to tackle this properly, they can find the bot code here:
 * https://github.com/curvefi/dust-cleaner-bot/blob/0795b2fa/app/services/controller.py#L90
 */
const getSoftLiquidationThreshold = (userIsCloseToLiquidation: boolean) => (userIsCloseToLiquidation ? 0 : 0.1)

/**
 * Whether the oracle price has dropped below the user's band range.
 * Band numbers go up as prices go down, so the user's lower price boundary is the higher band
 * number (n2, or `userBandsValue[1]` after `reverseBands`). If the active/oracle-price band has
 * moved past it, the price is below the user's range and their collateral has fully converted.
 */
export const isBelowRange = (activeBand: number | null | undefined, lowerBoundBand: number | null | undefined) =>
  activeBand != null && lowerBoundBand != null && activeBand > lowerBoundBand

/**
 * Picks the health value to display to the user. Health is the buffer before full liquidation,
 * which happens at health = 0 (see the liquidation-protection docs).
 *
 * `healthNotFull` values collateral at each band's mid-price only — it's the buffer as measured
 * inside the liquidation-protection range, ignoring any price cushion above the range.
 * `healthFull` adds that above-range cushion on top, so above the range `healthFull >= healthNotFull`
 * and inside/below the range they're equal.
 *
 * We display `healthFull` by default because it reflects the user's actual current buffer. But when
 * `healthNotFull` is negative the band-valued collateral no longer covers the debt, meaning the user
 * is one drop into the range away from full liquidation — so we surface that pessimistic value as a
 * warning even if `healthFull` would still look positive.
 *
 * See https://docs.curve.finance/user/llamalend/liquidation-protection/how-it-works.
 */
export const getDisplayHealth = (
  healthFull: Decimal | number | null | undefined,
  healthNotFull: Decimal | number | null | undefined,
): number | null => {
  if (healthFull == null || healthNotFull == null) return null
  return +(+healthNotFull < 0 ? healthNotFull : healthFull)
}

/**
 * healthNotFull is needed here because:
 * User full health can be > 0
 * But user is at risk of liquidation if not full < 0
 */
export function getLiquidationStatus(
  healthNotFull: Decimal | undefined,
  userIsCloseToSoftLiquidation: boolean,
  userIsBelowRange: boolean,
  userStateCollateral: Decimal | undefined,
  userStateBorrowed: Decimal | undefined,
): UserPositionStatus {
  if (healthNotFull == null || userStateCollateral == null || userStateBorrowed == null) return undefined
  const threshold = getSoftLiquidationThreshold(userIsCloseToSoftLiquidation)
  if (+healthNotFull < 0) return 'hardLiquidation' as const
  if (userIsBelowRange && +userStateCollateral > 0) return 'incompleteConversion' as const
  if (userIsBelowRange && +userStateCollateral <= 0) return 'fullyConverted' as const
  if (+userStateBorrowed > threshold) return 'softLiquidation' as const
  return 'healthy' as const
}

/** @deprecated Use {@link getLiquidationStatus} — this legacy version returns label/tooltip for the old forms. */
export function getLiquidationStatusLegacy(
  healthNotFull: string,
  userIsCloseToLiquidation: boolean,
  userStateStablecoin: string,
) {
  const userStatus: { label: string; colorKey: HealthColorKey; tooltip: string } = {
    label: 'Healthy',
    colorKey: 'healthy',
    tooltip: '',
  }

  const threshold = getSoftLiquidationThreshold(userIsCloseToLiquidation)

  if (+healthNotFull < 0) {
    userStatus.label = 'Hard liquidatable'
    userStatus.colorKey = 'hard_liquidation'
    userStatus.tooltip =
      'Hard liquidation is like a usual liquidation, which can happen only if you experience significant losses in soft liquidation so that you get below 0 health.'
  } else if (+userStateStablecoin > threshold) {
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

export function getIsUserCloseToSoftLiquidation(
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
  const sortedKeys = sortBy(objectKeys(bandsBalances), k => +k)
  const bandsBalancesArr: { borrowed: string; collateral: string; band: number }[] = []
  for (const k of sortedKeys) {
    bandsBalancesArr.push({ ...bandsBalances[k], band: k })
  }
  return { bandsBalancesArr, bandsBalances }
}

export function sortBandsMint(bandBalances: { [key: string]: { stablecoin: string; collateral: string } }) {
  const sortedKeys = sortBy(objectKeys(bandBalances).map(k => +k))
  const bandBalancesArr: { stablecoin: string; collateral: string; band: string }[] = []
  for (const k of sortedKeys) {
    bandBalancesArr.push({ ...bandBalances[k], band: `${k}` })
  }
  return { bandBalancesArr, bandBalances }
}

/**
 * Formats a collateral + borrowed notional string, e.g. "1.5K WETH + 200 crvUSD".
 * Returns undefined if collateral value is not available.
 */
export const formatCollateralNotional = (
  collateral: { value: number | null | undefined; symbol: string | undefined },
  borrow: { value: number | null | undefined; symbol: string | undefined } | undefined,
): string | undefined =>
  notFalsy(
    collateral.value &&
      collateral.symbol &&
      `${formatNumber(collateral.value, { abbreviate: true })} ${collateral.symbol}`,
    borrow && borrow.value && borrow.symbol && `${formatNumber(borrow.value, { abbreviate: true })} ${borrow.symbol}`,
  ).join(' + ')

/** Tooltip title for borrow APR. The title should be "Net borrow APR" if there are extra rewards or rebasing yield, otherwise "Borrow APR". */
export const getBorrowRateTooltipTitle = ({
  totalBorrowApr,
  extraRewards,
  rebasingYieldApr,
}: Pick<MarketNetBorrowAprTooltipContentProps, 'totalBorrowApr' | 'extraRewards' | 'rebasingYieldApr'>) =>
  totalBorrowApr != null && (extraRewards.length || rebasingYieldApr != null) ? t`Net borrow APR` : t`Borrow APR`

/** Compute utilization percentage from available liquidity and total assets. */
export const getUtilizationPercent = (available: Decimal | undefined, totalAssets: Decimal | undefined) => {
  if (available == null || totalAssets == null) return undefined
  const total = +totalAssets
  if (total === 0) return undefined
  return ((total - +available) / total) * 100
}

/**
 * Calculates the return to wallet amounts for a given receive amount.
 */
export function calculateReturnToWallet({
  totalBorrowed = '0',
  userState,
  stateCollateralDelta = '0',
  collateralSymbol,
  borrowedSymbol,
}: {
  totalBorrowed: Decimal | undefined
  userState: UserState | undefined
  stateCollateralDelta: Decimal | undefined
  collateralSymbol: string
  borrowedSymbol: string
}): { value: Decimal; symbol: string }[] {
  const { debt: stateDebt = '0', collateral: stateCollateral = '0', stablecoin: stateBorrowed = '0' } = userState ?? {}
  if (+totalBorrowed > 0) {
    const returnCollateral = decimalMinus(stateCollateral, stateCollateralDelta)
    const returnBorrowed = decimalMinus(decimalSum(totalBorrowed, stateBorrowed), stateDebt)
    return notFalsy(
      +returnCollateral > 0 && { value: returnCollateral, symbol: collateralSymbol },
      +returnBorrowed > 0 && { value: returnBorrowed, symbol: borrowedSymbol },
    )
  }
  const returnBorrowed = decimalMinus(stateBorrowed, stateDebt)
  return notFalsy(
    { value: stateCollateral, symbol: collateralSymbol },
    +returnBorrowed > 0 && { value: returnBorrowed, symbol: borrowedSymbol },
  )
}

export const getBadDebtMarketKey = (chain: Chain, controllerAddress: Address) =>
  `${chain}:${controllerAddress.toLowerCase()}`

export const createGetBadDebtMarket = (badDebtMarkets: BadDebt | undefined) => {
  const badDebtByMarket = new Map(
    (badDebtMarkets ?? []).map(market => [getBadDebtMarketKey(market.chain, market.controllerAddress), market]),
  )
  return (chain: Chain, controllerAddress: Address) =>
    badDebtByMarket.get(getBadDebtMarketKey(chain, controllerAddress))?.badDebt
}

export const calculateMarketSolvency = ({
  totalAssetsUsd,
  badDebtUsd,
}: {
  totalAssetsUsd: number
  badDebtUsd: number | undefined
}) => (totalAssetsUsd && badDebtUsd != null ? (Math.max(0, totalAssetsUsd - badDebtUsd) / totalAssetsUsd) * 100 : null)
