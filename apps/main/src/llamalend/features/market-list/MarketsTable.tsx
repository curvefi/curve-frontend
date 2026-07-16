import { useRef, useState } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@ui-kit/shared/ui/DataTable/TableFiltersChip'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { MarketsChips } from './chips/MarketsChips'
import { DEFAULT_SORT, MARKET_COLUMNS, MarketColumnId } from './columns'
import { MarketSortDrawer } from './drawers/MarketSortDrawer'
import { useMarketsGlobalFilterFn } from './filters/hooks/useMarketsGlobalFilter'
import { getMarketFacetedRowModel } from './filters/marketFaceting'
import { MarketsFiltersCollapsible } from './filters/MarketsFiltersCollapsible'
import { MarketsFiltersOverlay } from './filters/MarketsFiltersOverlay'
import { getMarketsColumnVariant, useMarketsVisibility } from './hooks/useMarketsVisibility'
import { MarketExpandedPanel } from './MarketExpandedPanel'
import { MarketExpandedPanelActions } from './MarketExpandedPanelActions'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

const pagination = { pageIndex: 0, pageSize: 200 }

export const MarketsTable = ({
  onReload,
  tableQuery,
  tableQuery: { data: queryData, isLoading },
}: {
  onReload: () => void
  tableQuery: QueryProp<LlamaMarketsResult>
}) => {
  const { markets: data = [], userHasPositions, hasFavorites } = queryData ?? {}
  const [filtersOpen, , , , setFiltersOpen] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    { columns: MarketColumnId },
  )
  const globalFilterFn = useMarketsGlobalFilterFn(data, globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useMarketsVisibility(
    LOCAL_STORAGE_KEY,
    sorting,
    getMarketsColumnVariant(userHasPositions),
  )
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useTable({
    columns: MARKET_COLUMNS,
    query: mapQuery(tableQuery, d => d.markets),
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange: setExpanded,
    globalFilterFn,
    ...getTableOptions(queryData ? data : undefined),
    getFacetedRowModel: getMarketFacetedRowModel,
  })

  const hasActiveFilters = !!table.getState().columnFilters.length

  return (
    <Stack>
      <TableHeader title={t`Markets`} onReload={onReload} isLoading={isLoading} />
      <DataTable
        table={table}
        emptyState={{
          title: t`No markets found`,
          description: t`Try adjusting your filters or search query`,
          button: { onClick: resetFilters, label: t`Show All Markets` },
        }}
        errorState={{ title: t`Could not load markets`, onReload }}
        expandedPanel={{ Body: MarketExpandedPanel, Actions: MarketExpandedPanelActions }}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      >
        <TableFilters<MarketColumnId>
          testIdPrefix={LOCAL_STORAGE_KEY}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          disableSearchAutoFocus
          searchText={globalFilter}
          onSearch={setGlobalFilter}
          collapsibleFilters={{
            collapsible: (
              <MarketsFiltersCollapsible
                table={table}
                resetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
                hasFavorites={hasFavorites}
                {...filterProps}
              />
            ),
            hasActiveFilters,
          }}
          filterChip={
            <TableFiltersChip
              popoverFilterChipRef={filterChipRef}
              open={filtersOpen}
              setOpen={setFiltersOpen}
              testId="btn-open-filters"
            />
          }
          sortChip={isMobile && <MarketSortDrawer onSortingChange={onSortingChange} sortField={sortField} />}
          chips={<MarketsChips hasFavorites={hasFavorites} {...filterProps} />}
        />
      </DataTable>
      {/* Keep the overlay outside DataTable children because DataTable remounts them when switching sticky header layout. */}
      <MarketsFiltersOverlay
        table={table}
        hasActiveFilters={hasActiveFilters}
        open={filtersOpen}
        setOpen={setFiltersOpen}
        anchorRef={filterChipRef}
        marketsQuery={mapQuery(tableQuery, d => d.markets)}
        resetFilters={resetFilters}
        {...filterProps}
      />
    </Stack>
  )
}
