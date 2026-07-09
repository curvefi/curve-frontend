import { useRef, useState } from 'react'
import type { LlamaMarket, LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@ui-kit/shared/ui/DataTable/TableFiltersChip'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS, LlamaMarketColumnId } from './columns'
import { MarketSortDrawer } from './drawers/MarketSortDrawer'
import { getLlamaFacetedRowModel } from './filters/llamaFaceting'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { LlamaTableFiltersCollapsible } from './filters/LlamaTableFiltersCollapsible'
import { LlamaTableFiltersOverlay } from './filters/LlamaTableFiltersOverlay'
import { getLlamaMarketsColumnVariant, useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

const pagination = { pageIndex: 0, pageSize: 200 }

const MarketExpandedPanelFooter: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => (
  <>
    {market.type === LlamaMarketType.Lend && (
      <Button component={Link} href={market.url + LEND_MARKET_ROUTES.PAGE_VAULT} data-testid="llama-market-go-to-vault">
        {t`Earn`}
      </Button>
    )}
    <Button component={Link} href={market.url} data-testid="llama-market-go-to-borrow">
      {t`Borrow`}
    </Button>
  </>
)

export const LlamaMarketsTable = ({
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
    { columns: LlamaMarketColumnId },
  )
  const globalFilterFn = useLlamaGlobalFilterFn(data, globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    LOCAL_STORAGE_KEY,
    sorting,
    getLlamaMarketsColumnVariant(userHasPositions),
  )
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    query: mapQuery(tableQuery, d => d.markets),
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange: setExpanded,
    globalFilterFn,
    ...getTableOptions(queryData ? data : undefined),
    getFacetedRowModel: getLlamaFacetedRowModel,
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
        expandedPanel={{ Body: LlamaMarketExpandedPanel, Footer: MarketExpandedPanelFooter }}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      >
        <TableFilters<LlamaMarketColumnId>
          testIdPrefix={LOCAL_STORAGE_KEY}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          disableSearchAutoFocus
          searchText={globalFilter}
          onSearch={setGlobalFilter}
          collapsibleFilters={{
            collapsible: (
              <LlamaTableFiltersCollapsible
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
          chips={<LlamaListChips hasFavorites={hasFavorites} {...filterProps} />}
        />
      </DataTable>
      {/* Keep the overlay outside DataTable children because DataTable remounts them when switching sticky header layout. */}
      <LlamaTableFiltersOverlay
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
