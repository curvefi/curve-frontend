import { useCallback, useMemo, useState } from 'react'
import { MARKET_CUTOFF_DATE } from '@/llamalend/constants'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import { ExpandedState } from '@tanstack/react-table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { serializeRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { useGlobalFilter } from '@ui-kit/shared/ui/DataTable/hooks/useGlobalFilter'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { LlamaChainFilterChips } from './chips/LlamaChainFilterChips'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT } from './columns'
import { LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

const useDefaultLlamaFilter = (minTvl: number) =>
  useMemo(
    () => [
      { id: LlamaMarketColumnId.DeprecatedMessage, value: 'no' },
      { id: LlamaMarketColumnId.Tvl, value: serializeRangeFilter([minTvl, null])! },
    ],
    [minTvl],
  )

const pagination = { pageIndex: 0, pageSize: 200 }

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
  const { markets, userHasPositions, hasFavorites } = result ?? {}

  const data = useMemo(
    // We're directly filtering the market list and not the hooks and queries, to avoid the chance of breaking
    // other components with potential missing data or incomplete metrics. It's purely presentational filtering.
    () => (markets ?? []).filter((market) => market.createdAt <= MARKET_CUTOFF_DATE.getTime()),
    [markets],
  )

  const minLiquidity = useUserProfileStore((s) => s.hideSmallPools) ? SMALL_POOL_TVL : 0
  const defaultFilters = useDefaultLlamaFilter(minLiquidity)
  const { globalFilter, setGlobalFilter, resetGlobalFilter } = useGlobalFilter()
  const globalFilterFn = useLlamaGlobalFilterFn(data, globalFilter)
  const {
    columnFilters,
    columnFiltersById,
    setColumnFilter,
    resetFilters: resetColumnFilters,
    hasFilters,
  } = useColumnFilters({
    title: LOCAL_STORAGE_KEY,
    columns: LlamaMarketColumnId,
    defaultFilters,
  })
  const resetFilters = useCallback(() => {
    resetColumnFilters()
    resetGlobalFilter()
  }, [resetColumnFilters, resetGlobalFilter])
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    LOCAL_STORAGE_KEY,
    sorting,
    userHasPositions,
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter, defaultFilters }

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    globalFilterFn,
    ...getTableOptions(result),
  })

  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <EmptyStateCard
            title={isError ? t`Could not load markets` : t`No markets found`}
            subtitle={isError ? undefined : t`Try adjusting your filters or search query`}
            action={
              <Button size="small" onClick={isError ? onReload : resetFilters}>
                {isError ? t`Reload` : t`Show All Markets`}
              </Button>
            }
          />
        </EmptyStateRow>
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
        searchText={globalFilter}
        hasSearchBar
        onSearch={setGlobalFilter}
        leftChildren={<TableFiltersTitles title={t`Markets`} subtitle={t`Find your next opportunity`} />}
        collapsible={<LendingMarketsFilters data={data} {...filterProps} />}
        chips={
          <>
            <LlamaChainFilterChips data={data} {...filterProps} />
            <LlamaListChips
              hiddenMarketCount={result ? data.length - table.getFilteredRowModel().rows.length : 0}
              hasFilters={hasFilters}
              resetFilters={resetFilters}
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
