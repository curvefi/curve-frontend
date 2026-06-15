import { Box } from '@mui/material'
import type { Row, Table } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxHeight } = SizesAndSpaces

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

type ActivityTableProps<TData extends TableItem> = {
  table: Table<TData>
  isLoading: boolean
  isError: boolean
  emptyMessage: string
  errorMessage: string
  height?: `${number}rem`
  expandedPanel?: ExpandedPanel<TData>
}

export const ActivityTable = <TData extends TableItem>({
  table,
  isLoading,
  isError,
  emptyMessage,
  errorMessage,
  height = MaxHeight.userEventsTable,
  expandedPanel = DefaultExpandedPanel,
}: ActivityTableProps<TData>) => (
  <Box sx={{ minHeight: height }}>
    <LegacyDataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table} size="lg">
          {isError ? (
            <ErrorMessage title={t`Hm... Something went wrong.`} subtitle={errorMessage} errorMessage={errorMessage} />
          ) : (
            <EmptyStateCard title={emptyMessage} />
          )}
        </EmptyStateRow>
      }
      loading={isLoading}
      maxHeight={height}
      size="small"
      expandedPanel={expandedPanel}
    />
  </Box>
)
