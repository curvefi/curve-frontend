import { useMarketContext } from '@/llamalend/features/market-context'
import {
  bufferAmount,
  collateralTokenValue,
  collateralValue,
  compositionShares,
  equity,
  leverage,
  formatBufferNotional,
  formatPriceDistanceHeadline,
  formatRangeLabel,
  inclusiveBandCount,
  formatBandSpan,
  oracleHealth,
  priceDistance,
} from '@/llamalend/features/market-position-details/position-metrics.utils'
import { cardPositionRoe, snapshotRebasingAprs, type CardRoe } from '@/llamalend/features/market-position-details/position-roe.utils'
import {
  resolvePositionStatus,
  type PositionStatus,
} from '@/llamalend/features/market-position-details/position-status.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { keepDisplayedValue } from '@/llamalend/position-metrics/display'
import { observationTime, riskProvenance, type RiskProvenance } from '@/llamalend/position-metrics/provenance'
import { useMarketOraclePrice, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import { useUserState } from '@/llamalend/queries/user'
import { useUserBands } from '@/llamalend/queries/user/user-bands.query'
import { useUserHealth } from '@/llamalend/queries/user/user-health.query'
import { useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import type { UserMarketParams } from '@evm-ui/queries/root-keys'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import type { MarketAssetsType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { getTokenPairUnit } from '@ui/lib/tokens'

export type BorrowPositionView = {
  health: QueryProp<Decimal | undefined>
  fullHealth: QueryProp<Decimal | undefined>
  bufferAmountLabel: QueryProp<string | undefined>
  status: PositionStatus | undefined
  assetsType: MarketAssetsType | undefined
  distanceLabel: QueryProp<string | undefined>
  rangeLabel: QueryProp<string | undefined>
  collateral: QueryProp<Decimal | undefined>
  composition: ReturnType<typeof compositionShares>
  debt: QueryProp<Decimal | undefined>
  borrowUsdRate: ReturnType<typeof useTokenUsdRate>
  leverage: QueryProp<Decimal | undefined>
  roe: QueryProp<CardRoe | undefined>
  priceUnit: string
  upperLabel: string | undefined
  lowerLabel: string | undefined
  bandCount: number | undefined
  bandRange: string | undefined
  fullHealthUpdatedAt: number
  refreshFailed: boolean
  provenance: RiskProvenance
}

export const useBorrowPositionView = (params: UserMarketParams, enabled = true): BorrowPositionView => {
  const { blockchainId, controllerAddress, marketType, chainId, tokens } = useMarketContext()
  const assetsType = getMarketAssetsType(chainId, controllerAddress)
  const oracle = useMarketOraclePrice(params, enabled)
  const userPrices = useUserPrices(params, enabled)
  const userState = useUserState(params, enabled)
  const fullHealth = useUserHealth({ ...params, isFull: true }, enabled)
  const userBands = useUserBands(params, enabled)
  const marketRates = useMarketRates({ chainId: params.chainId, marketId: params.marketId }, enabled)
  const rateSnapshots = useMarketSnapshots({
    blockchainId,
    controllerAddress,
    marketType,
    range: { kind: 'limit', limit: 1 },
    enabled,
  })
  const borrowSymbol = tokens.borrowToken?.symbol ?? ''
  const borrowUsdRate = useTokenUsdRate(
    { chainId: params.chainId, tokenAddress: tokens.borrowToken?.address },
    enabled,
  )
  const priceUnit = getTokenPairUnit([tokens.collateralToken?.symbol, tokens.borrowToken?.symbol])
  const health = combineQueries([oracle, userPrices], (price, prices) =>
    prices ? oracleHealth(price, prices[1]) : undefined,
  )
  const bufferAmountLabel = combineQueries([fullHealth, userState], (healthPoints, state) =>
    healthPoints ? formatBufferNotional(bufferAmount(state.debt, healthPoints), borrowSymbol) : undefined,
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
  const composition = combineQueries([collateralAssets, userState, collateral], (assets, state, total) =>
    compositionShares(assets, state.stablecoin, total),
  )
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
    bufferAmountLabel: keepDisplayedValue(bufferAmountLabel),
    status,
    assetsType,
    distanceLabel: keepDisplayedValue(mapQuery(distance, formatPriceDistanceHeadline)),
    rangeLabel: mapQuery(userPrices, prices =>
      prices ? formatRangeLabel(prices[1], prices[0], priceUnit) : undefined,
    ),
    collateral: keepDisplayedValue(collateral),
    composition: composition.data,
    debt: keepDisplayedValue(mapQuery(userState, ({ debt }) => debt)),
    borrowUsdRate,
    leverage: keepDisplayedValue(leverageValue),
    roe: keepDisplayedValue(roe),
    priceUnit,
    upperLabel: userPrices.data ? formatNumber(userPrices.data[1], { abbreviate: true }) : undefined,
    lowerLabel: userPrices.data ? formatNumber(userPrices.data[0], { abbreviate: true }) : undefined,
    bandCount: userBands.data ? inclusiveBandCount(userBands.data[0], userBands.data[1]) : undefined,
    bandRange: userBands.data ? formatBandSpan(userBands.data[0], userBands.data[1]) : undefined,
    fullHealthUpdatedAt: fullHealth.dataUpdatedAt,
    refreshFailed: watched.some(query => query.error != null && query.data != null),
    provenance: riskProvenance([observationTime(fullHealth), observationTime(oracle), observationTime(userState)]),
  }
}
