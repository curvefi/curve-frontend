import {
  ActivityTable,
  LlammaTradesExpandedPanel,
  LlammaEventsExpandedPanel,
} from '@ui-kit/features/activity-table'
import { useLlammaActivity, type UseLlammaActivityProps } from './useLlammaActivity'

export type LlammaActivityProps = UseLlammaActivityProps

export const LlammaActivity = ({
  network,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityProps) => {
  const { activeSelection, setActiveSelection, selections, tradesTableConfig, eventsTableConfig } = useLlammaActivity({
    network,
    collateralToken,
    borrowToken,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return (
    <>
      {activeSelection === 'trades' && (
        <ActivityTable
          selections={selections}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={tradesTableConfig}
          expandedPanel={LlammaTradesExpandedPanel}
        />
      )}
      {activeSelection === 'events' && (
        <ActivityTable
          selections={selections}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={eventsTableConfig}
          expandedPanel={LlammaEventsExpandedPanel}
        />
      )}
    </>
  )
}
