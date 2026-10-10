import { getIsUserCloseToSoftLiquidation, getLiquidationStatus, isBelowRange } from '@/llamalend/llama.utils'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market/market-oracle-price-band.query'
import { useUserBands } from '@/llamalend/queries/user/user-bands.query'
import { useUserHealth } from '@/llamalend/queries/user/user-health.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'

export const useLiquidationStatus = (params: UserMarketParams, enabled?: boolean) =>
  combineQueries(
    [
      useUserState(params, enabled),
      useUserHealth({ ...params, isFull: false }, enabled),
      useUserBands(params, enabled),
      useMarketOraclePriceBand(params, enabled),
    ],
    ({ collateral, stablecoin: borrowed }, userHealthNotFull, [upperBoundary, lowerBoundary], oraclePriceBand) =>
      getLiquidationStatus(
        userHealthNotFull,
        getIsUserCloseToSoftLiquidation(upperBoundary, oraclePriceBand),
        isBelowRange(oraclePriceBand, lowerBoundary),
        collateral,
        borrowed,
      ),
  )

export const useIsInLiquidation = (params: UserMarketParams, enabled?: boolean) =>
  mapQuery(useLiquidationStatus(params, enabled), status =>
    ['softLiquidation', 'hardLiquidation', 'fullyConverted'].includes(status),
  )
