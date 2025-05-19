import { useCallback, useState } from 'react'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '@/loan/components/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { useLlamaMarketsColumnVisibility } from '@/loan/components/PageLlamaMarkets/hooks/useLlamaMarketsColumnVisibility'
import { useLlamaMarketSortOptions } from '@/loan/components/PageLlamaMarkets/hooks/useLlamaMarketSortOptions'
import { LendingMarketsFilters } from '@/loan/components/PageLlamaMarkets/LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from '@/loan/components/PageLlamaMarkets/LlamaMarketExpandedPanel'
import { MarketsFilterChips } from '@/loan/components/PageLlamaMarkets/MarketsFilterChips'
import { type LlamaMarketsResult } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import {
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth, Sizing } = SizesAndSpaces

const useVisibility = () => useVisibilitySettings(useLlamaMarketsColumnVisibility())

// todo: rename to LlamaMarketsTable
export const LendingMarketsTable = ({
  onReload,
  result,
  headerHeight,
  isError,
  minLiquidity,
}: {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  headerHeight: string
  isError: boolean
  minLiquidity: number
}) => {
  const { markets: data = [], hasPositions, hasFavorites } = result ?? {}
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters([
    { id: LlamaMarketColumnId.LiquidityUsd, value: [minLiquidity, undefined] },
  ])
  const { columnSettings, columnVisibility, toggleVisibility } = useVisibility()
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded, sorting, columnVisibility, columnFilters },
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
        rowSx={{ height: { ...Sizing['3xl'], mobile: 77 } }} // the 3xl is too small in mobile (64px)
        emptyText={isError ? t`Could not load markets` : t`No markets found`}
        expandedPanel={LlamaMarketExpandedPanel}
      >
        <TableFilters<LlamaMarketColumnId>
          title={t`Llamalend Markets`}
          subtitle={t`Borrow with the power of Curve soft liquidations`}
          onReload={onReload}
          learnMoreUrl="https://docs.curve.finance/lending/overview/"
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          onSearch={useCallback(
            (search: string) => setColumnFilter(LlamaMarketColumnId.Assets, search || undefined),
            [setColumnFilter],
          )}
          collapsible={
            <LendingMarketsFilters
              columnFilters={columnFiltersById}
              setColumnFilter={setColumnFilter}
              data={data}
              minLiquidity={minLiquidity}
            />
          }
          chips={
            <MarketsFilterChips
              hiddenMarketCount={data.length - table.getFilteredRowModel().rows.length}
              columnFiltersById={columnFiltersById}
              setColumnFilter={setColumnFilter}
              hasFilters={columnFilters.length > 0}
              hasPositions={hasPositions}
              hasFavorites={hasFavorites}
              resetFilters={resetFilters}
            />
          }
          sort={
            <SelectFilter
              name="sort"
              options={useLlamaMarketSortOptions()}
              onSelected={({ id }) => table.setSorting([{ id, desc: true }])}
              value={(sorting.length ? sorting : DEFAULT_SORT)[0].id}
            />
          }
        />
      </DataTable>
    </Stack>
  )
}
