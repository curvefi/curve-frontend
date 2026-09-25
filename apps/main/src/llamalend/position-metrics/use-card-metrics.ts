import { useMarketContext } from '@/llamalend/features/market-context'
import { collateralTokenValue, collateralValue, equity, equityLeverage } from '@/llamalend/features/market-position-details/position-metrics.utils'
import { positionReturnOnEquity, type YieldInput } from '@/llamalend/features/market-position-details/position-roe.utils'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useMarketOraclePrice, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import { useUserState } from '@/llamalend/queries/user'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimal, decimalDiv, decimalEqual, decimalSum, ZERO } from '@ui/lib/decimal'

const aprFraction = (percentagePoints: Decimal | number | Nullish): YieldInput => {
  if (percentagePoints == null) return { unavailable: true }
  const points = decimal(percentagePoints)
  const hundred = decimal('100')
  if (points == undefined || hundred == undefined) return { unavailable: true }
  const fraction = decimalDiv(points, hundred)
  return fraction == undefined ? { unavailable: true } : { aprFraction: fraction }
}

const roePercent = (
  collateralQuantity: Decimal,
  oraclePrice: Decimal,
  stablecoin: Decimal,
  debt: Decimal,
  collateralApr: number | Nullish,
  borrowedApr: number | Nullish,
  borrowApr: Decimal | number | Nullish,
) => {
  const tokenValue = collateralTokenValue(collateralQuantity, oraclePrice)
  const equityAmount = equity(collateralValue(collateralQuantity, oraclePrice, stablecoin), debt)
  if (borrowApr == null) return undefined
  if (collateralApr == null && !decimalEqual(tokenValue, ZERO)) return undefined
  const result = positionReturnOnEquity({
    collateralValue: tokenValue,
    borrowedValue: stablecoin,
    debt,
    equity: equityAmount,
    collateralYield: decimalEqual(tokenValue, ZERO) || collateralApr == null ? { unnecessary: true } : aprFraction(collateralApr),
    borrowedYield: decimalEqual(stablecoin, ZERO) || borrowedApr == null ? { unnecessary: true } : aprFraction(borrowedApr),
    borrowCost: decimalEqual(debt, ZERO) ? { unnecessary: true } : aprFraction(borrowApr),
    rewards: { unnecessary: true },
  })
  return result.status === 'value' ? formatNumber(result.aprPercent, 'percent.rate') : undefined
}

/** Current card leverage, collateral value over equity. */
export function useCardLeverage(params: UserMarketParams, enabled = true) {
  const state = useUserState(params, enabled)
  const oracle = useMarketOraclePrice(params, enabled)
  return combineQueries([state, oracle], (user, price) =>
    equityLeverage(user.collateral, price, user.stablecoin, user.debt),
  )
}

/**
 * Borrow-more leverage in card units.
 * With no added size this is the open position. With a preview it is that same ratio after the trade.
 */
export function useBorrowMoreCardLeverage(params: BorrowMoreParams, enabled = true): QueryProp<Decimal | null> {
  const beta = useNewLlamalendHealth()
  const state = useUserState(params, enabled && beta)
  const oracle = useMarketOraclePrice(params, enabled && beta)
  const expected = useBorrowMoreExpectedCollateral(params, enabled && beta && !!params.leverageEnabled)
  const current = useCardLeverage(params, enabled && beta)
  const added = (collateral: Decimal, user: { collateral: Decimal; stablecoin: Decimal; debt: Decimal }, price: Decimal) => {
    const quantity = decimalSum(user.collateral, collateral)
    const debt = decimalSum(user.debt, params.debt ?? '0')
    if (quantity == undefined || debt == undefined) return undefined
    return equityLeverage(quantity, price, user.stablecoin, debt)
  }
  const plainPreview = combineQueries([state, oracle], (user, price) => added(params.userCollateral ?? '0', user, price))
  const leveragedPreview = combineQueries([state, oracle, expected], (user, price, addedCollateral) =>
    added(addedCollateral.totalCollateral, user, price),
  )
  const preview = params.leverageEnabled ? leveragedPreview : plainPreview
  const hasAddedSize =
    (params.userCollateral != null && params.userCollateral !== '0') || (params.debt != null && params.debt !== '0')
  if (!beta) return q({ data: undefined, isLoading: false, error: null })
  return hasAddedSize && preview.data != null ? preview : current
}

/** Current return on equity, same balance formula as the position card. */
export function useCardReturnOnEquity(params: UserMarketParams, enabled = true) {
  const { blockchainId, controllerAddress, marketType } = useMarketContext()
  const state = useUserState(params, enabled)
  const oracle = useMarketOraclePrice(params, enabled)
  const rates = useMarketRates({ chainId: params.chainId, marketId: params.marketId })
  const snapshots = useMarketSnapshots({ blockchainId, controllerAddress, marketType, range: { kind: 'limit', limit: 1 }, enabled })
  return combineQueries([state, oracle, rates, snapshots], (user, price, marketRates, history) => {
    const latest = history.at(-1)
    if (!latest) return undefined
    const borrowed = 'borrowedToken' in latest ? latest.borrowedToken : latest.stablecoinToken
    return roePercent(
      user.collateral,
      price,
      user.stablecoin,
      user.debt,
      latest.collateralToken.rebasingYieldApr,
      borrowed.rebasingYieldApr,
      marketRates.borrowApr,
    )
  })
}
