import { useMemo, useRef, useState } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import { ExpandedState } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
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
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { FilterChip } from './chips/FilterChip'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS, LlamaMarketColumnId } from './columns'
import { MarketSortDrawer } from './drawers/MarketSortDrawer'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { LlamaTableFiltersCollapsible } from './filters/LlamaTableFiltersCollapsible'
import { LlamaTableFiltersPopover } from './filters/LlamaTableFiltersPopover'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

const pagination = { pageIndex: 0, pageSize: 200 }

export const LlamaMarketsTable = ({
  onReload,
  tableQuery,
}: {
  onReload: () => void
  tableQuery: QueryProp<LlamaMarketsResult>
}) => {
  const { markets: resultMarkets, userHasPositions, hasFavorites } = tableQuery.data ?? {}
  const [isLoading, isError] = [tableQuery.isLoading, !!tableQuery.error]
  const data = useMemo(() => resultMarkets ?? [], [resultMarkets])
  const [filterPopoverOpen, , closeFilterPopover, toggleFilterPopover] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
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
    ...getTableOptions(tableQuery.data),
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
      isLoading={isLoading}
    >
      <TableFilters<LlamaMarketColumnId>
        testIdPrefix={LOCAL_STORAGE_KEY}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        disableSearchAutoFocus
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        header={
          <TableFiltersHeader
            title={t`Markets`}
            rightChildren={<TableButton onClick={onReload} icon={ReloadIcon} rotateIcon={isLoading} />}
          />
        }
        collapsibleFilters={{
          collapsible: <LlamaTableFiltersCollapsible table={table} resetFilters={resetFilters} {...filterProps} />,
          hasActiveFilters: !!getHiddenCount(table),
        }}
        popoverFilters={
          <LlamaTableFiltersPopover
            hiddenCount={getHiddenCount(table)}
            open={filterPopoverOpen}
            onClose={closeFilterPopover}
            anchorRef={filterChipRef}
            markets={mapQuery(tableQuery, d => d.markets)}
            resetFilters={resetFilters}
            {...filterProps}
          />
        }
        filterChip={
          <FilterChip
            filterChipRef={filterChipRef}
            filterPopoverOpen={filterPopoverOpen}
            toggleFilterPopover={toggleFilterPopover}
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
