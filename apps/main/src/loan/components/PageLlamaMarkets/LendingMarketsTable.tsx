import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/TableFilters'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { LendingMarketsFilters } from '@/loan/components/PageLlamaMarkets/LendingMarketsFilters'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { useVisibilitySettings } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { MarketsFilterChips } from '@/loan/components/PageLlamaMarkets/MarketsFilterChips'
import { DEFAULT_SORT, DEFAULT_VISIBILITY, LLAMA_MARKET_COLUMNS } from '@/loan/components/PageLlamaMarkets/columns'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

const { Spacing, MaxWidth } = SizesAndSpaces

export const LendingMarketsTable = ({
  onReload,
  data,
  headerHeight,
  isError,
}: {
  onReload: () => void
  data: LlamaMarket[]
  headerHeight: string
  isError: boolean
}) => {
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters()
  const { columnSettings, columnVisibility, toggleVisibility } = useVisibilitySettings(DEFAULT_VISIBILITY)

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnVisibility, columnFilters },
    onSortingChange,
    maxMultiSortColCount: 3, // allow 3 columns to be sorted at once while holding shift
  })

  return (
    <Stack
      sx={{
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
        maxWidth: MaxWidth.table,
      }}
    >
      <DataTable
        table={table}
        headerHeight={headerHeight}
        rowHeight="3xl"
        emptyText={isError ? t`Could not load markets` : t`No markets found`}
      >
        <TableFilters
          title={t`Llamalend Markets`}
          subtitle={t`Select a market to view more details`}
          onReload={onReload}
          learnMoreUrl="https://docs.curve.fi/lending/overview/"
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          onResetFilters={resetFilters}
          collapsible={
            <LendingMarketsFilters columnFilters={columnFiltersById} setColumnFilter={setColumnFilter} data={data} />
          }
        >
          <MarketsFilterChips columnFiltersById={columnFiltersById} setColumnFilter={setColumnFilter} />
        </TableFilters>
      </DataTable>
    </Stack>
  )
}
