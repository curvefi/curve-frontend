import { useRef, useState } from 'react'
import type { LlamaMarketsTableResult } from '@/llamalend/queries/market-list/llama-market-stats'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { useFilters } from '@ui/features/tables/hooks/useFilters'
import { TableFilters } from '@ui/features/tables/TableFilters'
import { TableFiltersChip } from '@ui/features/tables/TableFiltersChip'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { useIsMobile, useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui/hooks/useSortFromQueryString'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
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
  onReload: () => Promise<unknown>
  tableQuery: QueryProp<LlamaMarketsTableResult>
}) => {
  const { markets: data = [], userHasPositions, hasFavorites } = queryData ?? {}
  const [filtersOpen, setFiltersOpen] = useState<boolean | undefined>()
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLTableSectionElement>(null)
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

  const table = useCurveTable({
    columns: MARKET_COLUMNS,
    query: mapQuery(tableQuery, d => d.markets),
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    getRowId: row => row.controllerAddress,
    onSortingChange,
    onExpandedChange: setExpanded,
    globalFilterFn,
    meta: { facetedRowModelFactory: getMarketFacetedRowModel, getRowHref: ({ url }) => url },
  })

  const hasActiveFilters = !!table.state.columnFilters.length

  return (
    <Stack>
      <TableHeader
        title={t`Markets`}
        onReload={onReload}
        isLoading={isLoading}
        visibilitySettings={{ isOpen: visibilitySettingsOpen, open: openVisibilitySettings }}
      />
      <EvmDataTable
        table={table}
        anchorRef={anchorRef}
        emptyState={{
          title: t`No markets found`,
          description: t`Try adjusting your filters or search query`,
          button: { onClick: resetFilters, label: t`Show All Markets` },
        }}
        errorState={{ title: t`Could not load markets`, onReload }}
        expandedPanel={{ Body: MarketExpandedPanel, Actions: MarketExpandedPanelActions }}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      >
        <TableFilters
          testIdPrefix={LOCAL_STORAGE_KEY}
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
      </EvmDataTable>
      <TableVisibilitySettingsPopover<MarketColumnId>
        anchorRef={anchorRef}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        open={visibilitySettingsOpen}
        onClose={closeVisibilitySettings}
      />
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
