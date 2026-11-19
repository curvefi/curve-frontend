import { ActivityTable } from '@evm-ui/features/activity-table/ActivityTable'
import { usePoolActivityLiquidityTable } from './hooks/usePoolActivityLiquidityTable'

export const LiquidityTab = ({
  liquidityTable,
}: {
  liquidityTable: ReturnType<typeof usePoolActivityLiquidityTable>
}) => <ActivityTable {...liquidityTable} />
