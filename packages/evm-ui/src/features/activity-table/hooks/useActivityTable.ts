import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { ACTIVITY_COLUMNS } from '../columns/columns.definitions'
import type { ActivityRow } from '../types'

/** Keep expansion tied to the event when a result changes at the same row position. */
export const getActivityRowId = ({ chainId, txHash, timestamp, address, action, deltas }: ActivityRow, index: number) =>
  JSON.stringify([
    chainId,
    txHash,
    timestamp,
    address,
    action.label,
    deltas.map(({ label, token, amount }) => [label, token?.address, amount]),
    index,
  ])

export const useActivityTable = (
  options: Omit<Parameters<typeof useCurveTable<ActivityRow>>[0], 'columns' | 'getRowId'>,
) => {
  const pageIndex = options.manualPagination ? options.state?.pagination?.pageIndex : undefined

  return useCurveTable({
    ...options,
    columns: ACTIVITY_COLUMNS,
    getRowId:
      pageIndex === undefined ? getActivityRowId : (row, index) => `${pageIndex + 1}:${getActivityRowId(row, index)}`,
  })
}
