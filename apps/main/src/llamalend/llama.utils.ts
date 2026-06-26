import { BigNumber } from 'bignumber.js'
import { zeroAddress } from 'viem'
import type { LlamaMarketTemplate, UserPositionStatus } from '@/llamalend/llamalend.types'
import type { AssetDetails, LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
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
import { type AllOrNone, assert, DEFAULT_DECIMALS, maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { getLib, requireLib, type Wallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { MetricProps } from '@ui-kit/shared/ui/Metric'
import { LlamaMarketType, LlamaMarketVersion } from '@ui-kit/types/market'
import { QueryProp } from '@ui-kit/types/util'
import { CRVUSD, decimal, decimalMinus, decimalMultiply, decimalSum, formatNumber } from '@ui-kit/utils'
import { SOLVENCY_THRESHOLDS } from './llama-markets.constants'

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

/**
 * Checks if a market supports leverage or not. A market supports leverage if:
 * - Lend Market and its `leverage` property has leverage
 * - Mint Market and either its `leverageZap` is not the zero address or its `leverageV2` property has leverage
 */
export const hasLeverage = <T extends LlamaMarketTemplate | undefined>(market: T) =>
  maybe(market, market => hasV1Leverage(market) || (market instanceof MintMarketTemplate && hasV2Leverage(market)))

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
    ? market.version === 'v1' && market.leverage.hasLeverage()
    : market?.leverageZap !== zeroAddress

export const hasV2Leverage = (_market: MintMarketTemplate) => false // market?.leverageV2.hasLeverage()

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

export const hasZapV2 = (_market: LlamaMarketTemplate) => false
/** isZapV2Enabled() &&
  market instanceof LendMarketTemplate &&
  market.leverageZapV2.hasLeverage() */

export const isRouterRequired = (
  type: 'zapV2' | 'V0' | 'V1' | 'V2' | 'deleverage' | 'unleveragedMint' | 'unleveragedLend' | 'unleveraged',
) => type == 'zapV2'

export const hasGauge = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate && market.addresses.gauge !== zeroAddress

export const getLendMarketVersion = (market: LendMarketTemplate): LlamaMarketVersion =>
  assert(
    { v1: LlamaMarketVersion.v1, v2: LlamaMarketVersion.v2 }[market.version],
    `Unsupported LlamaLend market version: ${market.version}`,
  )

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

export type MarketToken = Pick<AssetDetails, 'symbol' | 'address' | 'decimals'>

export type MarketTokens = { collateralToken: MarketToken; borrowToken: MarketToken }

/** Accepts either both tokens or an empty object. Avoid Partial<> because it could allow one of the tokens only */
export type MarketTokensOrEmpty = AllOrNone<MarketTokens>

type MarketOrApiValue<T, Value> = T extends LlamaMarketTemplate ? Value : Value | undefined

const getMarketOrApiValue = <T extends LlamaMarketTemplate | null | undefined, Value>(
  market: T,
  apiMarket: LlamaMarket | undefined,
  getMarketValue: (market: LlamaMarketTemplate) => Value,
  getApiValue: (apiMarket: LlamaMarket) => Value,
): MarketOrApiValue<T, Value> =>
  maybe(market, getMarketValue) ?? (maybe(apiMarket, getApiValue) as MarketOrApiValue<T, Value>)

export const getMarketType = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, LlamaMarketType> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    m => (m instanceof LendMarketTemplate ? LlamaMarketType.Lend : LlamaMarketType.Mint),
    m => m.type,
  )

export const getTokens = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, MarketTokens> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    (market: LlamaMarketTemplate): MarketTokens =>
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
          },
    ({ assets }) => ({ collateralToken: assets.collateral, borrowToken: assets.borrowed }),
  )

export const getAmmAddress = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, Address> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    market => (market instanceof LendMarketTemplate ? market.addresses.amm : market.address) as Address,
    m => m.ammAddress,
  )

export const getControllerAddress = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, Address> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    market => (market instanceof LendMarketTemplate ? market.addresses.controller : market.controller) as Address,
    m => m.controllerAddress,
  )

export const getVaultAddress = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, Address | null> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    market => (market instanceof LendMarketTemplate ? (market.addresses.vault as Address) : null),
    m => m.vaultAddress,
  )

export const getGaugeAddress = (market: LlamaMarketTemplate | null | undefined): Address | undefined =>
  market instanceof LendMarketTemplate && market.addresses.gauge !== zeroAddress
    ? (market.addresses.gauge as Address)
    : undefined

export const getVaultToken = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, MarketToken | undefined> =>
  maybe(getVaultAddress(market, apiMarket), address => ({
    address,
    symbol: t`Vault shares`,
    decimals: DEFAULT_DECIMALS,
  }))

export type BandRange = { minBands: number; maxBands: number }
export type BandRangeOrEmpty = AllOrNone<BandRange>

export const getMarketBandRange = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, BandRange | undefined> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    m => ({ minBands: +m.minBands, maxBands: +m.maxBands }),
    m => maybes([m.minBand, m.maxBand], ([minBands, maxBands]) => ({ minBands, maxBands })),
  )

export const getCrvTokenAddress = (market: LlamaMarketTemplate | null | undefined): Address | undefined =>
  maybe(market, m => m.getLlamalend().constants.ALIASES.crv as Address)

export const getMonetaryPolicy = <T extends LlamaMarketTemplate | null | undefined>(
  market: T,
  apiMarket?: LlamaMarket,
): MarketOrApiValue<T, Address | undefined> =>
  getMarketOrApiValue(
    market,
    apiMarket,
    market =>
      (market instanceof LendMarketTemplate ? market.addresses.monetary_policy : market.monetaryPolicy) as Address,
    m => m.monetaryPolicyAddress,
  )

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

export const calculateLendMarketTvlUsd = ({
  borrowedBalanceUsd,
  collateralBalanceUsd,
  totalAssetsUsd,
  totalDebtUsd,
}: {
  borrowedBalanceUsd: number
  collateralBalanceUsd: number
  totalAssetsUsd: number
  totalDebtUsd: number
}) => borrowedBalanceUsd + collateralBalanceUsd + totalAssetsUsd - totalDebtUsd

export const calculateMintMarketTvlUsd = ({ collateralAmountUsd }: { collateralAmountUsd: number }) =>
  collateralAmountUsd

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
  void updateEvents(wallet.address, networkId, address as Address, txHash as Hex)
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

/**
 * Formats a collateral + borrowed notional string, e.g. "1.5K WETH + 200 crvUSD".
 * Returns undefined if collateral value is not available.
 */
export const formatCollateralNotional = (
  collateral: { value: Decimal | null | undefined; symbol: string | undefined },
  borrow: { value: Decimal | null | undefined; symbol: string | undefined } | undefined,
): string | undefined =>
  notFalsy(
    collateral.value &&
      +collateral.value &&
      collateral.symbol &&
      `${formatNumber(collateral.value, { abbreviate: true })} ${collateral.symbol}`,
    borrow?.value &&
      +borrow?.value &&
      borrow.symbol &&
      `${formatNumber(borrow.value, { abbreviate: true })} ${borrow.symbol}`,
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

export const createGetBadDebtMarket = (badDebtMarkets: BadDebt | undefined) => {
  const toKey = (chain: Chain, controllerAddress: Address) => `${chain}:${controllerAddress.toLowerCase()}`
  const badDebtByMarket = new Map(
    (badDebtMarkets ?? []).map(market => [toKey(market.chain, market.controllerAddress), market]),
  )
  return (chain: Chain, controllerAddress: Address) => badDebtByMarket.get(toKey(chain, controllerAddress))?.badDebt
}

export const calculateMarketSolvency = ({
  totalAssetsUsd,
  badDebtUsd,
}: {
  totalAssetsUsd: number
  badDebtUsd: number | undefined
}) => (totalAssetsUsd && badDebtUsd != null ? (Math.max(0, totalAssetsUsd - badDebtUsd) / totalAssetsUsd) * 100 : null)

export const lowSolvencyDeprecatedMessage = (solvencyPercent: number | null) =>
  solvencyPercent != null && solvencyPercent < SOLVENCY_THRESHOLDS.low
    ? t`This market is deprecated due to low solvency`
    : null

export const getZapAddress = <T extends LlamaMarketTemplate | undefined>(market: T) =>
  maybe(market, m => (hasZapV2(m) ? (m.getZapAddress() as Address) : undefined))

/** Builds Metric props for a token-denominated value with the matching USD notional shown below it. */
export const tokenMetric = ({
  value,
  symbol,
  usdRate,
}: {
  value: MetricProps['value']
  symbol: string | null | undefined
  usdRate: QueryProp<Amount>
}) =>
  ({
    value,
    valueOptions: {
      abbreviate: true,
      unit: maybe(symbol, symbol => ({ symbol, position: 'suffix' as const })),
    },
    notional: maybes([decimal(value.data), usdRate.data], ([value, usdRate]) => ({
      value: decimalMultiply(value, usdRate),
      unit: 'dollar' as const,
    })),
  }) satisfies Pick<MetricProps, 'value' | 'valueOptions' | 'notional'>
