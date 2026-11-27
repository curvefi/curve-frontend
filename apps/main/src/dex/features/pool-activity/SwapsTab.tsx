import { ActivityTable } from '@ui/features/tables/activity-table/ActivityTable'
import { usePoolActivitySwapsTable } from './hooks/usePoolActivitySwapsTable'

export const SwapsTab = ({ swapsTable }: { swapsTable: ReturnType<typeof usePoolActivitySwapsTable> }) => (
  <ActivityTable {...swapsTable} />
)
