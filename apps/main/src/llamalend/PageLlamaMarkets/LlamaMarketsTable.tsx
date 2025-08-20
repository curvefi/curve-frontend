import lodash from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { type LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { LlamaListFilterChips } from '@/llamalend/PageLlamaMarkets/chips/LlamaListFilterChips'
import { MarketsFilterChips } from '@/llamalend/PageLlamaMarkets/chips/MarketsFilterChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from '@/llamalend/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import {
  maxMultiSortColCount,
  useLlamaMarketSortOptions,
} from '@/llamalend/PageLlamaMarkets/hooks/useLlamaMarketSortOptions'
import { ExpandedState, useReactTable } from '@tanstack/react-table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable, getTableModels } from '@ui-kit/shared/ui/DataTable'
import { type Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const { isEqual } = lodash
const TITLE = 'Llamalend Markets' // not using the t`` here as the value is used as a key in the local storage

const useDefaultLlamaFilter = (minLiquidity: number) =>
  useMemo(() => [{ id: LlamaMarketColumnId.LiquidityUsd, value: [minLiquidity, null] }], [minLiquidity])

export const LlamaMarketsTable = ({
  onReload,
  result,
  isError,
  loading,
}: {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
  loading: boolean
}) => {
  const { markets: data = [], userPositions, hasFavorites } = result ?? {}

  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0
  const defaultFilters = useDefaultLlamaFilter(minLiquidity)
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(TITLE, defaultFilters)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    TITLE,
    sorting,
    userPositions,
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)

  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    autoResetPageIndex: false, // autoreset causing stack too deep issues when receiving new data
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    maxMultiSortColCount,
    ...getTableModels(result),
  })

  return (
    <DataTable
      table={table}
      emptyText={isError ? t`Could not load markets` : t`No markets found`}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userPositions)}
      loading={loading}
    >
      <TableFilters<LlamaMarketColumnId>
        title={TITLE}
        subtitle={t`Borrow with the power of Curve soft liquidations`}
        loading={loading}
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
            resetFilters={resetFilters}
          >
            <LlamaListFilterChips
              userPositions={userPositions}
              hasFavorites={hasFavorites}
              columnFiltersById={columnFiltersById}
              setColumnFilter={setColumnFilter}
            />
          </MarketsFilterChips>
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
