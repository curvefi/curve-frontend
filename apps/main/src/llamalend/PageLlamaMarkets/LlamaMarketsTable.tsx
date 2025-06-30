import { useCallback, useMemo, useState } from 'react'
import { type LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '@/llamalend/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import {
  createLlamaMarketsColumnOptions,
  createLlamaMarketsMobileColumns,
} from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketsColumnVisibility'
import { useLlamaMarketSortOptions } from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketSortOptions'
import { LendingMarketsFilters } from '@/llamalend/PageLlamaMarkets/LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from '@/llamalend/PageLlamaMarkets/LlamaMarketExpandedPanel'
import { MarketsFilterChips } from '@/llamalend/PageLlamaMarkets/MarketsFilterChips'
import Stack from '@mui/material/Stack'
import {
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { type Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth } = SizesAndSpaces

/**
 * Hook to manage the visibility of columns in the Llama Markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
const useVisibility = (sorting: SortingState, hasPositions: boolean | undefined) => {
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as LlamaMarketColumnId
  const groups = useMemo(() => createLlamaMarketsColumnOptions(hasPositions), [hasPositions])
  const visibilitySettings = useVisibilitySettings(groups, LLAMA_MARKET_COLUMNS)
  const columnVisibility = useMemo(() => createLlamaMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}

export const LlamaMarketsTable = ({
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
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useVisibility(sorting, result?.hasPositions)
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

  const onSearch = useCallback(
    (search: string) => setColumnFilter(LlamaMarketColumnId.Assets, search || undefined),
    [setColumnFilter],
  )
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
        emptyText={isError ? t`Could not load markets` : t`No markets found`}
        expandedPanel={LlamaMarketExpandedPanel}
        shouldStickFirstColumn={useIsTablet() && !!hasPositions}
      >
        <TableFilters<LlamaMarketColumnId>
          title={t`Llamalend Markets`}
          subtitle={t`Borrow with the power of Curve soft liquidations`}
          onReload={onReload}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          onSearch={onSearch}
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
              onSearch={onSearch}
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
              onSelected={useCallback(
                ({ id }: Option<LlamaMarketColumnId>) => onSortingChange([{ id, desc: true }]),
                [onSortingChange],
              )}
              value={sortField}
            />
          }
        />
      </DataTable>
    </Stack>
  )
}
