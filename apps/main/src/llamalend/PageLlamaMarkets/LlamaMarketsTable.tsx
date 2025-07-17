import lodash from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { type LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '@/llamalend/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import {
  createLlamaMarketsMobileColumns,
  getColumnVariant,
  LLAMA_MARKETS_COLUMN_OPTIONS,
} from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketsColumnVisibility'
import { useLlamaMarketSortOptions } from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketSortOptions'
import { LendingMarketsFilters } from '@/llamalend/PageLlamaMarkets/LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from '@/llamalend/PageLlamaMarkets/LlamaMarketExpandedPanel'
import { MarketsFilterChips } from '@/llamalend/PageLlamaMarkets/MarketsFilterChips'
import {
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { type Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/TableVisibilitySettingsPopover'

const { isEqual } = lodash
const TITLE = 'Llamalend Markets' // not using the t`` here as the value is used as a key in the local storage

/**
 * Hook to manage the visibility of columns in the Llama Markets table.
 * The visibility on mobile is based on the sort field.
 * On larger devices, it uses the visibility settings that may be customized by the user.
 */
const useVisibility = (sorting: SortingState, hasPositions: boolean | undefined) => {
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as LlamaMarketColumnId
  const variant = getColumnVariant(hasPositions)
  const visibilitySettings = useVisibilitySettings(TITLE, LLAMA_MARKETS_COLUMN_OPTIONS, variant, LLAMA_MARKET_COLUMNS)
  const columnVisibility = useMemo(() => createLlamaMarketsMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}

const useDefaultLlamaFilter = (minLiquidity: number) =>
  useMemo(() => [{ id: LlamaMarketColumnId.LiquidityUsd, value: [minLiquidity, null] }], [minLiquidity])

const useSearch = (columnFiltersById: Record<string, unknown>, setColumnFilter: (id: string, value: unknown) => void) =>
  [
    (columnFiltersById[LlamaMarketColumnId.Assets] as string) ?? '',
    useCallback(
      (search: string) => setColumnFilter(LlamaMarketColumnId.Assets, search || undefined),
      [setColumnFilter],
    ),
  ] as const

export const LlamaMarketsTable = ({
  onReload,
  result,
  isError,
}: {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
}) => {
  const { markets: data = [], hasPositions, hasFavorites } = result ?? {}

  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0
  const defaultFilters = useDefaultLlamaFilter(minLiquidity)
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(TITLE, defaultFilters)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useVisibility(sorting, hasPositions)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)

  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // only pass the filtered model once loaded, it causes an error: https://github.com/TanStack/table/issues/5026
    getFilteredRowModel: result && getFilteredRowModel(),
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    maxMultiSortColCount: 3, // allow 3 columns to be sorted at once while holding shift
  })

  return (
    <DataTable
      table={table}
      emptyText={isError ? t`Could not load markets` : t`No markets found`}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={useIsTablet() && !!hasPositions}
    >
      <TableFilters<LlamaMarketColumnId>
        title={TITLE}
        subtitle={t`Borrow with the power of Curve soft liquidations`}
        onReload={onReload}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        searchText={searchText}
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
            searchText={searchText}
            onSearch={onSearch}
            hiddenMarketCount={result ? data.length - table.getFilteredRowModel().rows.length : 0}
            columnFiltersById={columnFiltersById}
            setColumnFilter={setColumnFilter}
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
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
  )
}
