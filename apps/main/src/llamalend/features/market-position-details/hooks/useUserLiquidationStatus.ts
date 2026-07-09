import { getIsUserCloseToSoftLiquidation, getLiquidationStatus, isBelowRange } from '@/llamalend/llama.utils'
import { useMarketLiquidationBand, useMarketOraclePriceBand } from '@/llamalend/queries/market'
import { useUserBands, useUserHealth, useUserState } from '@/llamalend/queries/user'
import { combineQueries } from '@ui-kit/lib'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'

export const useLiquidationStatus = (params: UserMarketParams, enabled?: boolean) =>
  combineQueries(
    [
      useUserState(params, enabled),
      useUserHealth({ ...params, isFull: false }, enabled),
      useUserBands(params, enabled),
      useMarketOraclePriceBand(params, enabled),
      useMarketLiquidationBand(params, enabled),
    ],
    ({ collateral, stablecoin: borrowed }, userHealthNotFull, [upperBoundary, lowerBoundary], oraclePrice, liqBand) =>
      getLiquidationStatus(
        userHealthNotFull,
        getIsUserCloseToSoftLiquidation(upperBoundary, liqBand, oraclePrice),
        isBelowRange(oraclePrice, lowerBoundary),
        collateral,
        borrowed,
      ),
  )

export const useIsInSoftLiquidation = (params: UserMarketParams, enabled?: boolean) =>
  mapQuery(useLiquidationStatus(params, enabled), status => ['softLiquidation', 'hardLiquidation'].includes(status))
