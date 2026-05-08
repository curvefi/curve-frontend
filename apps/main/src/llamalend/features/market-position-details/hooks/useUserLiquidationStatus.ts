import { useMemo } from 'react'
import { getIsUserCloseToSoftLiquidation, getLiquidationStatus, isBelowRange } from '@/llamalend/llama.utils'
import { useMarketLiquidationBand, useMarketOraclePriceBand } from '@/llamalend/queries/market'
import { useUserBands, useUserHealth, useUserState } from '@/llamalend/queries/user'
import { combineQueryState } from '@ui-kit/lib'
import type { UserMarketParams } from '@ui-kit/lib/model'

export function useLiquidationStatus(params: UserMarketParams) {
  const userState = useUserState(params)
  const userHealthNotFull = useUserHealth({ ...params, isFull: false })
  const userBands = useUserBands(params)
  const oraclePrice = useMarketOraclePriceBand(params)
  const liqBand = useMarketLiquidationBand(params)
  const { collateral, stablecoin: borrowed } = userState.data ?? {}

  const positionStatus = useMemo(() => {
    if (!userHealthNotFull.data || !userBands.data) return undefined
    const isCloseToSoftLiquidation = getIsUserCloseToSoftLiquidation(
      userBands.data[0],
      liqBand.data ?? null,
      oraclePrice.data,
    )
    const [, lowerBoundary] = userBands.data
    return getLiquidationStatus(
      userHealthNotFull.data,
      isCloseToSoftLiquidation,
      isBelowRange(oraclePrice.data, lowerBoundary),
      collateral,
      borrowed,
    )
  }, [userHealthNotFull.data, userBands.data, liqBand.data, oraclePrice.data, collateral, borrowed])
  return {
    data: positionStatus,
    ...combineQueryState(userState, userHealthNotFull, userBands, oraclePrice, liqBand),
  }
}
