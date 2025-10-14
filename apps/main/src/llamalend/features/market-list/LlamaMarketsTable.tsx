import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { type LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { ColumnFiltersState, ExpandedState, useReactTable } from '@tanstack/react-table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { t } from '@ui-kit/lib/i18n'
import { type FilterProps, getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { ChainFilterChipWrapper } from './chips/ChainFilterChipWrapper'
import { MarketFilterChipWrapper } from './chips/MarketFilterChipWrapper'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns.enum'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const { isEqual } = lodash
const LOCAL_STORAGE_KEY = 'Llamalend Markets' // not using the t`` here as the value is used as a key in the local storage

const useDefaultLlamaFilter = (minLiquidity: number) =>
  useMemo(() => [{ id: LlamaMarketColumnId.Tvl, value: [minLiquidity, null] }], [minLiquidity])

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
    LOCAL_STORAGE_KEY,
    migration,
    defaultFilters,
  )
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    LOCAL_STORAGE_KEY,
    sorting,
    userHasPositions,
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const filterProps: FilterProps<string> = { columnFiltersById, setColumnFilter }

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
        filterExpandedKey={LOCAL_STORAGE_KEY}
        loading={loading}
        onReload={onReload}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        searchText={searchText}
        hasSearchBar
        onSearch={onSearch}
        leftChildren={<TableFiltersTitles title={t`Markets`} subtitle={t`Find your next opportunity`} />}
        collapsible={
          <LendingMarketsFilters
            data={data}
            minLiquidity={minLiquidity}
            columnFilters={columnFiltersById}
            setColumnFilter={setColumnFilter}
          />
        }
        chips={
          <>
            <ChainFilterChipWrapper data={data} {...filterProps} />
            <MarketFilterChipWrapper
              hiddenMarketCount={result ? data.length - table.getFilteredRowModel().rows.length : 0}
              hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
              resetFilters={resetFilters}
              userHasPositions={userHasPositions}
              hasFavorites={hasFavorites}
              onSortingChange={onSortingChange}
              sortField={sortField}
              data={data}
              minLiquidity={minLiquidity}
              {...filterProps}
            />
          </>
        }
      />
    </DataTable>
  )
}
