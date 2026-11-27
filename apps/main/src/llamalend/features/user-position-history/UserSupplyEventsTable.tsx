import type { QueryProp } from '@ui/features/queries/util'
import { ActivityTable } from '@ui/features/tables/activity-table/ActivityTable'
import { useUserSupplyActivityTable } from './hooks/useUserSupplyActivityTable'
import type { ParsedUserSupplyEvent } from './hooks/useUserSupplyEvents'

export const UserSupplyEventsTable = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserSupplyEvent[]> }) => (
  <ActivityTable {...useUserSupplyActivityTable(eventsQuery)} />
)
