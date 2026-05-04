import { useMemo, useState } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import { ExpandedState } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useFilterExpanded } from '@ui-kit/hooks/useLocalStorage'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { getHiddenCount, getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { TableButton } from '@ui-kit/shared/ui/DataTable/TableButton'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersHeader } from '@ui-kit/shared/ui/DataTable/TableFiltersHeader'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { FilterChip } from './chips/FilterChip'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS, LlamaMarketColumnId } from './columns'
import { MarketSortDrawer } from './drawers/MarketSortDrawer'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

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
  const data = useMemo(() => markets ?? [], [markets])
  const [filterExpanded, setFilterExpanded] = useFilterExpanded(LOCAL_STORAGE_KEY)
  const isMobile = useIsMobile()

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    { columns: LlamaMarketColumnId },
  )
  const globalFilterFn = useLlamaGlobalFilterFn(data, globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    LOCAL_STORAGE_KEY,
    sorting,
    userHasPositions,
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }

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
        filterExpanded={filterExpanded}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        disableSearchAutoFocus
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        header={
          <TableFiltersHeader
            title={t`Markets`}
            rightChildren={<TableButton onClick={onReload} icon={ReloadIcon} rotateIcon={loading} />}
          />
        }
        collapsible={<LendingMarketsFilters data={data} {...filterProps} />}
        filterChip={
          <FilterChip
            filterExpanded={filterExpanded}
            setFilterExpanded={setFilterExpanded}
            hiddenCount={getHiddenCount(table)}
            resetFilters={resetFilters}
            hasFavorites={hasFavorites}
            data={data}
            {...filterProps}
          />
        }
        sortChip={isMobile && <MarketSortDrawer onSortingChange={onSortingChange} sortField={sortField} />}
        chips={<LlamaListChips hasFavorites={hasFavorites} {...filterProps} />}
      />
    </DataTable>
  )
}
