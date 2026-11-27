import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import type { QueryProp } from '@ui/features/queries/util'
import { useUserBorrowActivityTable } from './hooks/useUserBorrowActivityTable'
import type { ParsedUserBorrowEvent } from './hooks/useUserBorrowEvents'

export const UserBorrowEventsTable = ({ eventsQuery }: { eventsQuery: QueryProp<ParsedUserBorrowEvent[]> }) => (
  <ActivityTable {...useUserBorrowActivityTable(eventsQuery)} />
)
