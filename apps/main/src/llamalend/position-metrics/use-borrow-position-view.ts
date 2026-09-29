import { useMarketContext } from '@/llamalend/features/market-context'
import {
  bufferAmount,
  collateralTokenValue,
  collateralValue,
  compositionShares,
  equity,
  leverage,
  oracleHealth,
  priceDistance,
  type PriceDistance,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { cardPositionRoe, snapshotRebasingAprs, type CardRoe } from '@/llamalend/features/market-position-details/position-roe.utils'
import {
  resolvePositionStatus,
  type PositionStatus,
} from '@/llamalend/features/market-position-details/position-status.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { useMarketOraclePrice, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import { useUserState } from '@/llamalend/queries/user'
import { useUserBands } from '@/llamalend/queries/user/user-bands.query'
import { useUserHealth } from '@/llamalend/queries/user/user-health.query'
import { useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q, type Query, type QueryProp, type Range } from '@ui/features/queries/util'
import { getTokenPairUnit } from '@ui/lib/tokens'

/** A failed refetch keeps the previous payload instead of replacing it with an error icon. */
const keepDisplayedValue = <T,>(query: Query<T>) =>
  q(query.data != null && query.error != null ? { data: query.data, isLoading: query.isLoading, error: null } : query)

type TimedQuery = { dataUpdatedAt: number }

export type RiskProvenance = {
  /** Oldest finite observation among the supplied times. */
  oldestAt: number | undefined
  /** False when any required input has no observation time. */
  complete: boolean
}

const observationTime = (query: TimedQuery): number | undefined =>
  Number.isFinite(query.dataUpdatedAt) ? query.dataUpdatedAt : undefined

/** A missing time keeps the set incomplete. */
const riskProvenance = (times: (number | undefined)[]): RiskProvenance => {
  const finite = times.filter((time): time is number => time != null && Number.isFinite(time))
  if (finite.length !== times.length) return { oldestAt: undefined, complete: false }
  return { oldestAt: Math.min(...finite), complete: true }
}

export type BorrowPositionView = {
  health: QueryProp<Decimal | undefined>
  fullHealth: QueryProp<Decimal | undefined>
  buffer: QueryProp<Decimal | undefined>
  status: PositionStatus | undefined
  assetsType: MarketAssetsType | undefined
  distance: QueryProp<PriceDistance | undefined>
  userPrices: ReturnType<typeof useUserPrices>
  collateral: QueryProp<Decimal | undefined>
  composition: ReturnType<typeof compositionShares>
  debt: QueryProp<Decimal | undefined>
  borrowUsdRate: ReturnType<typeof useTokenUsdRate>
  leverage: QueryProp<Decimal | undefined>
  roe: QueryProp<CardRoe | undefined>
  priceUnit: string
  bands: Range<number> | undefined
  fullHealthUpdatedAt: number
  refreshFailed: boolean
  provenance: RiskProvenance
}

export const useBorrowPositionView = (params: UserMarketParams): BorrowPositionView => {
  const { blockchainId, controllerAddress, marketType, chainId, tokens } = useMarketContext()
  const assetsType = getMarketAssetsType(chainId, controllerAddress)
  const oracle = useMarketOraclePrice(params)
  const userPrices = useUserPrices(params)
  const userState = useUserState(params)
  const fullHealth = useUserHealth({ ...params, isFull: true })
  const userBands = useUserBands(params)
  const marketRates = useMarketRates({ chainId: params.chainId, marketId: params.marketId })
  const rateSnapshots = useMarketSnapshots({
    blockchainId,
    controllerAddress,
    marketType,
    range: { kind: 'limit', limit: 1 },
  })
  const borrowUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: tokens.borrowToken?.address })
  const priceUnit = getTokenPairUnit([tokens.collateralToken?.symbol, tokens.borrowToken?.symbol])
  const health = combineQueries([oracle, userPrices], (price, prices) =>
    prices ? oracleHealth(price, prices[1]) : undefined,
  )
  const buffer = combineQueries([fullHealth, userState], (healthPoints, state) =>
    healthPoints ? bufferAmount(state.debt, healthPoints) : undefined,
  )
  const collateral = combineQueries([oracle, userState], (price, state) =>
    collateralValue(state.collateral, price, state.stablecoin),
  )
  const collateralAssets = combineQueries([oracle, userState], (price, state) =>
    collateralTokenValue(state.collateral, price),
  )
  const equityValue = combineQueries([collateral, userState], (assets, state) => equity(assets, state.debt))
  const leverageValue = combineQueries([collateralAssets, equityValue], (tokenValue, equityAmount) =>
    leverage(tokenValue, equityAmount),
  )
  const composition = combineQueries([collateralAssets, collateral], (assets, total) => compositionShares(assets, total))
  const distance = combineQueries([oracle, userPrices], (price, prices) =>
    prices ? priceDistance(price, prices[1], prices[0]) : undefined,
  )
  const roe = combineQueries(
    [collateralAssets, userState, equityValue, marketRates, rateSnapshots],
    (assets, state, equityAmount, rates, snapshots) => {
      const latest = snapshots.at(-1)
      if (!latest || equityAmount == undefined) return { status: 'unavailable' as const }
      const yields = snapshotRebasingAprs(latest)
      return cardPositionRoe({
        collateralValue: assets,
        borrowedValue: state.stablecoin,
        debt: state.debt,
        equity: equityAmount,
        collateralApr: yields.collateralApr,
        borrowedApr: yields.borrowedApr,
        borrowApr: rates.borrowApr,
      })
    },
  )
  const status =
    oracle.data && userPrices.data && userState.data
      ? resolvePositionStatus({
          oraclePrice: oracle.data,
          upperPrice: userPrices.data[1],
          lowerPrice: userPrices.data[0],
          fullHealth: fullHealth.data,
          debt: userState.data.debt,
          liquidationPredicate: 'strict-negative',
          assetsType,
        })
      : undefined
  const watched = [fullHealth, oracle, userPrices, userState]
  return {
    health: keepDisplayedValue(health),
    fullHealth: keepDisplayedValue(fullHealth),
    buffer: keepDisplayedValue(buffer),
    status,
    assetsType,
    distance: keepDisplayedValue(distance),
    userPrices,
    collateral: keepDisplayedValue(collateral),
    composition: composition.data,
    debt: keepDisplayedValue(mapQuery(userState, ({ debt }) => debt)),
    borrowUsdRate,
    leverage: keepDisplayedValue(leverageValue),
    roe: keepDisplayedValue(roe),
    priceUnit,
    bands: userBands.data,
    fullHealthUpdatedAt: fullHealth.dataUpdatedAt,
    refreshFailed: watched.some(query => query.error != null && query.data != null),
    provenance: riskProvenance([observationTime(fullHealth), observationTime(oracle), observationTime(userState)]),
  }
}
