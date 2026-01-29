import { ActivityTable, LlammaEventsExpandedPanel } from '@ui-kit/features/activity-table'
import { useLlammaActivityEvents } from './hooks/useLlammaActivityEvents'
import { LlammaActivityProps } from './'

export const LlammaActivityEvents = ({
  network,
  collateralToken,
  borrowToken,
  ammAddress,
  endpoint,
  networkConfig,
}: LlammaActivityProps) => {
  const { eventsTableConfig } = useLlammaActivityEvents({
    network,
    collateralToken,
    borrowToken,
    ammAddress,
    endpoint,
    networkConfig,
  })

  return <ActivityTable tableConfig={eventsTableConfig} expandedPanel={LlammaEventsExpandedPanel} />
}
