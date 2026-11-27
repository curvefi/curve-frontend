import type { QueryProp } from '@ui/features/queries/util'
import { ActivityTable } from '@ui/features/tables/activity-table/ActivityTable'
import { useUserBorrowActivityTable } from './hooks/useUserBorrowActivityTable'
import type { ParsedUserBorrowEvent } from './hooks/useUserBorrowEvents'

export const UserBorrowEventsTable = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserBorrowEvent[]> }) => (
  <ActivityTable {...useUserBorrowActivityTable(eventsQuery)} />
)
