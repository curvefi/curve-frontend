import { useActionInfos } from './hooks/useActionInfos'
import { useClosePositionTab } from './hooks/useClosePositionTab'
import { useImproveHealthTab } from './hooks/useImproveHealthTab'
import type { MarketParams } from './types'
import { ManageSoftLiquidationCard } from './ui/ManageSoftLiquidationCard'

/** Main component hooking up the manage soft liquidation card with data from hooks. */
export const ManageSoftLiquidation = (params: MarketParams) => {
  const improveHealthTab = useImproveHealthTab(params)
  const closePositionTab = useClosePositionTab(params)
  const actionInfos = useActionInfos(params)

  return (
    <ManageSoftLiquidationCard
      actionInfos={actionInfos}
      improveHealth={improveHealthTab}
      closePosition={closePositionTab}
    />
  )
}
