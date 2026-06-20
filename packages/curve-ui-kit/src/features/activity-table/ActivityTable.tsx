import { Box } from '@mui/material'
import type { Row, Table } from '@tanstack/react-table'
import type { TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxHeight } = SizesAndSpaces

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

type ActivityTableProps<TData extends TableItem> = {
  table: TanstackTable<TData>
  emptyTitle: string
  errorTitle: string
  height?: `${number}rem`
  expandedPanel?: ExpandedPanel<TData>
}

export const ActivityTable = <TData extends TableItem>({
  table,
  emptyTitle,
  errorTitle,
  height = MaxHeight.userEventsTable,
  expandedPanel = DefaultExpandedPanel,
}: ActivityTableProps<TData>) => (
  <Box sx={{ minHeight: height }}>
    <DataTable table={table} emptyState={{ emptyTitle, errorTitle }} maxHeight={height} expandedPanel={expandedPanel} />
  </Box>
)
