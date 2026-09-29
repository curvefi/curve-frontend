import { useMarketContext } from '@/llamalend/features/market-context'
import {
  collateralTokenValue,
  collateralValue,
  equity,
  equityLeverage,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import {
  cardPositionRoe,
  snapshotRebasingAprs,
} from '@/llamalend/features/market-position-details/position-roe.utils'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useMarketOraclePrice, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import { useUserState } from '@/llamalend/queries/user'
import type { BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'

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
  const added = (
    collateral: Decimal,
    user: { collateral: Decimal; stablecoin: Decimal; debt: Decimal },
    price: Decimal,
  ) => {
    const quantity = decimalSum(user.collateral, collateral)
    const debt = decimalSum(user.debt, params.debt ?? '0')
    if (quantity == undefined || debt == undefined) return undefined
    return equityLeverage(quantity, price, user.stablecoin, debt)
  }
  const plainPreview = combineQueries([state, oracle], (user, price) =>
    added(params.userCollateral ?? '0', user, price),
  )
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
  const beta = useNewLlamalendHealth()
  const { blockchainId, controllerAddress, marketType } = useMarketContext()
  const state = useUserState(params, enabled && beta)
  const oracle = useMarketOraclePrice(params, enabled && beta)
  const rates = useMarketRates({ chainId: params.chainId, marketId: params.marketId }, enabled && beta)
  const snapshots = useMarketSnapshots({
    blockchainId,
    controllerAddress,
    marketType,
    range: { kind: 'limit', limit: 1 },
    enabled: enabled && beta,
  })
  return combineQueries([state, oracle, rates, snapshots], (user, price, marketRates, history) => {
    const latest = history.at(-1)
    if (!latest) return undefined
    const yields = snapshotRebasingAprs(latest)
    const tokenValue = collateralTokenValue(user.collateral, price)
    const equityAmount = equity(collateralValue(user.collateral, price, user.stablecoin), user.debt)
    const result = cardPositionRoe({
      collateralValue: tokenValue,
      borrowedValue: user.stablecoin,
      debt: user.debt,
      equity: equityAmount,
      collateralApr: yields.collateralApr,
      borrowedApr: yields.borrowedApr,
      borrowApr: marketRates.borrowApr,
    })
    return result.status === 'value' ? formatNumber(result.aprPercent, 'percent.rate') : undefined
  })
}
