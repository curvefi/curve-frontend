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
import { DataTable, getTableOptions } from '@ui-kit/shared/ui/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { LlamaListFilterChips } from './chips/LlamaListFilterChips'
import { MarketFilterChipWrapper } from './chips/MarketFilterChipWrapper'
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
  useMemo(() => [{ id: LlamaMarketColumnId.TVL, value: [minLiquidity, null] }], [minLiquidity])

const migration: MigrationOptions<ColumnFiltersState> = {
  version: 1,
  // migration from v0 to v1: remove default liquidity filter
  migrate: (oldValue, initialValue) => [
    ...initialValue.filter((i) => !oldValue.some((o) => o.id === i.id)),
    ...oldValue.filter((o) => !isEqual(o, { id: LlamaMarketColumnId.LiquidityUsd, value: [10000, null] })),
  ],
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
          <MarketFilterChipWrapper
            hiddenMarketCount={result ? data.length - table.getFilteredRowModel().rows.length : 0}
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
          >
            {!isMobile && <TableSearchField value={searchText} onChange={onSearch} />}
            <MarketTypeFilterChips {...filterProps} />
            <LlamaListFilterChips userHasPositions={userHasPositions} hasFavorites={hasFavorites} {...filterProps} />
          </MarketFilterChipWrapper>
        }
        sort={<LlamaMarketSort onSortingChange={onSortingChange} sortField={sortField} />}
      />
    </DataTable>
  )
}
