import { ActivityTable } from '@ui/features/tables/activity-table/ActivityTable'
import { usePoolActivityLiquidityTable } from './hooks/usePoolActivityLiquidityTable'

export const LiquidityTab = ({
  liquidityTable,
}: {
  liquidityTable: ReturnType<typeof usePoolActivityLiquidityTable>
}) => <ActivityTable {...liquidityTable} />
