import { useMarketContext } from '@/llamalend/features/market-context'
import {
  collateralTokenValue,
  collateralValue,
  equity,
  loopedDebt,
  loopedLeverage,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { cardPositionRoe, snapshotRebasingAprs } from '@/llamalend/features/market-position-details/position-roe.utils'
import { useZapDebtShare } from '@/llamalend/position-metrics/zap-debt-share'
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
import { DISABLED_Q, type QueryProp } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'

/** Zap debt share of the current user's position in the market in context. */
export function usePositionZapDebtShare(params: UserMarketParams, enabled: boolean) {
  const { blockchainId, controllerAddress, marketType } = useMarketContext()
  return useZapDebtShare(
    { blockchainId, contractAddress: controllerAddress, userAddress: params.userAddress, marketType },
    enabled,
  )
}

/** Current card leverage: collateral value over equity, counting only looped debt. */
export function useCardLeverage(params: UserMarketParams, enabled = true) {
  const state = useUserState(params, enabled)
  const oracle = useMarketOraclePrice(params, enabled)
  const zapShare = usePositionZapDebtShare(params, enabled)
  return combineQueries([state, oracle, zapShare], (user, price, share) =>
    loopedLeverage(user.collateral, price, user.stablecoin, loopedDebt(user.debt, share)),
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
  const zapShare = usePositionZapDebtShare(params, enabled && beta)
  const current = useCardLeverage(params, enabled && beta)
  // Leveraged borrow-more loops its new debt into collateral; a plain borrow sends it to the wallet.
  const added = (
    collateral: Decimal,
    user: { collateral: Decimal; stablecoin: Decimal; debt: Decimal },
    price: Decimal,
    share: Decimal,
  ) => {
    const quantity = decimalSum(user.collateral, collateral)
    const looped = params.leverageEnabled
      ? decimalSum(loopedDebt(user.debt, share), params.debt ?? '0')
      : loopedDebt(user.debt, share)
    if (quantity == undefined || looped == undefined) return undefined
    return loopedLeverage(quantity, price, user.stablecoin, looped)
  }
  const plainPreview = combineQueries([state, oracle, zapShare], (user, price, share) =>
    added(params.userCollateral ?? '0', user, price, share),
  )
  const leveragedPreview = combineQueries([state, oracle, expected, zapShare], (user, price, addedCollateral, share) =>
    added(addedCollateral.totalCollateral, user, price, share),
  )
  const preview = params.leverageEnabled ? leveragedPreview : plainPreview
  const hasAddedSize =
    (params.userCollateral != null && params.userCollateral !== '0') || (params.debt != null && params.debt !== '0')
  if (!beta) return DISABLED_Q
  return hasAddedSize && preview.data != null ? preview : current
}

/**
 * Card leverage after an action that changes collateral or debt without looping new debt (repay, add or remove collateral).
 * The existing zap share applies pro rata to the remaining debt. Repay withdraws the soft-liquidation cash to repay debt.
 */
export function useCardLeverageAfter(
  params: UserMarketParams,
  {
    collateralDelta,
    debtAfter,
    clearsStablecoin = false,
  }: { collateralDelta: Decimal | Nullish; debtAfter: QueryProp<Decimal | null>; clearsStablecoin?: boolean },
  enabled = true,
): QueryProp<Decimal | null> {
  const beta = useNewLlamalendHealth()
  const state = useUserState(params, enabled && beta)
  const oracle = useMarketOraclePrice(params, enabled && beta)
  const zapShare = usePositionZapDebtShare(params, enabled && beta)
  const after = combineQueries([state, oracle, zapShare, debtAfter], (user, price, share, debt) => {
    const collateral = decimalSum(user.collateral, collateralDelta ?? '0')
    if (debt == null || collateral == undefined) return null
    return loopedLeverage(collateral, price, clearsStablecoin ? '0' : user.stablecoin, loopedDebt(debt, share)) ?? null
  })
  return beta ? after : DISABLED_Q
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
