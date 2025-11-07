import { useCallback, useState } from 'react'
import { MarketRateType } from '@ui-kit/types/market'

export const useShowAllPositionsRows = (tab: MarketRateType) => {
  const [showAllState, setShowAllState] = useState<Record<MarketRateType, boolean>>({
    [MarketRateType.Borrow]: false,
    [MarketRateType.Supply]: false,
  })

  const isShowingAll = showAllState[tab]

  const showAllRows = useCallback(() => {
    setShowAllState((prev) => ({
      ...prev,
      [tab]: true,
    }))
  }, [tab])

  return [isShowingAll, showAllRows] as const
}
