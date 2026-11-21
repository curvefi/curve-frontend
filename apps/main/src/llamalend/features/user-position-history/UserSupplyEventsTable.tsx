import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import type { QueryProp } from '@ui/features/queries/util'
import { useUserSupplyActivityTable } from './hooks/useUserSupplyActivityTable'
import type { ParsedUserSupplyEvent } from './hooks/useUserSupplyEvents'

export const UserSupplyEventsTable = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserSupplyEvent[]> }) => (
  <ActivityTable {...useUserSupplyActivityTable(eventsQuery)} />
)
