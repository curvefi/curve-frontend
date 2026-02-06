import { Box } from '@mui/material'
import type { Row, Table } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxHeight } = SizesAndSpaces

/** Default expanded panel that renders nothing (for tables without mobile expansion) */
const DefaultExpandedPanel = <T extends TableItem>(_props: { row: Row<T>; table: Table<T> }) => null

export type ActivityTableProps<TData extends TableItem> = {
  table: Table<TData>
  isLoading: boolean
  isError: boolean
  emptyMessage?: string
  height?: `${number}rem`
  expandedPanel?: ExpandedPanel<TData>
}

export const ActivityTable = <TData extends TableItem>({
  table,
  isLoading,
  isError,
  emptyMessage,
  height = MaxHeight.userEventsTable,
  expandedPanel = DefaultExpandedPanel,
}: ActivityTableProps<TData>) => {
  const errorMessage = isError ? (emptyMessage ?? t`Could not load data`) : (emptyMessage ?? t`No data found`)

  return (
    <Box minHeight={height}>
      <DataTable
        table={table}
        emptyState={
          <EmptyStateRow table={table} size="lg">
            <ErrorMessage
              title={t`Hm... Something went wrong.`}
              subtitle={errorMessage}
              errorMessage={t`Couldn't load activity table data`}
            />
          </EmptyStateRow>
        }
        loading={isLoading}
        maxHeight={height}
        expandedPanel={expandedPanel}
      />
    </Box>
  )
}
