import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { type LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { ColumnFiltersState, ExpandedState, useReactTable } from '@tanstack/react-table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { t } from '@ui-kit/lib/i18n'
import { FilterChips } from '@ui-kit/shared/ui/DataTable/chips/FilterChips'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { LlamaListFilterChips } from './chips/LlamaListFilterChips'
import { MarketTypeFilterChips } from './chips/MarketTypeFilterChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns.enum'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { LlamaMarketSort } from './LlamaMarketSort'

const { isEqual } = lodash
const TITLE = 'Llamalend Markets' // not using the t`` here as the value is used as a key in the local storage

const useDefaultLlamaFilter = (minLiquidity: number) =>
  useMemo(
    () => [
      { id: LlamaMarketColumnId.DeprecatedMessage, value: false },
      { id: LlamaMarketColumnId.Tvl, value: [minLiquidity, null] },
    ],
    [minLiquidity],
  )

const migration: MigrationOptions<ColumnFiltersState> = {
  version: 2,
  // migration from v1 to v2: add deprecated filter
  migrate: (oldValue, initial) => [...initial.filter((i) => !oldValue.some((o) => o.id === i.id)), ...oldValue],
}

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
  const { markets: data = [], userHasPositions, hasFavorites } = result ?? {}

  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0
  const defaultFilters = useDefaultLlamaFilter(minLiquidity)
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(
    TITLE,
    migration,
    defaultFilters,
  )
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    TITLE,
    sorting,
    userHasPositions,
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const isMobile = useIsMobile()
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(result),
  })

  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>{isError ? t`Could not load markets` : t`No markets found`}</EmptyStateRow>
      }
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
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
          <FilterChips
            hiddenMarketCount={result ? data.length - table.getFilteredRowModel().rows.length : 0}
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
          >
            {!isMobile && <TableSearchField value={searchText} onChange={onSearch} />}
            <MarketTypeFilterChips {...filterProps} />
            <LlamaListFilterChips userHasPositions={userHasPositions} hasFavorites={hasFavorites} {...filterProps} />
          </FilterChips>
        }
        sort={<LlamaMarketSort onSortingChange={onSortingChange} sortField={sortField} />}
      />
    </DataTable>
  )
}
