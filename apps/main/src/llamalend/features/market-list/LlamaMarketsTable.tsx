import { useRef, useState } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ExpandedState } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { mapQuery, QueryProp } from '@ui-kit/types/util'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS, LlamaMarketColumnId } from './columns'
import { MarketSortDrawer } from './drawers/MarketSortDrawer'
import { getLlamaFacetedRowModel } from './filters/llamaFaceting'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { LlamaTableFilters } from './filters/LlamaTableFilters'
import { LlamaTableFiltersCollapsible } from './filters/LlamaTableFiltersCollapsible'
import { getLlamaMarketsColumnVariant, useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

const pagination = { pageIndex: 0, pageSize: 200 }

export const LlamaMarketsTable = ({
  onReload,
  tableQuery,
  tableQuery: { data: queryData, isLoading, error },
}: {
  onReload: () => void
  tableQuery: QueryProp<LlamaMarketsResult>
}) => {
  const { markets: data = [], userHasPositions, hasFavorites } = queryData ?? {}
  const isError = !!error
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
    data,
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange: setExpanded,
    globalFilterFn,
    ...getTableOptions(queryData ? data : undefined),
    getFacetedRowModel: queryData && getLlamaFacetedRowModel,
  })

  const hasActiveFilters = !!table.getState().columnFilters.length

  return (
    <Stack>
      <TableHeader title={t`Markets`} onReload={onReload} isLoading={isLoading} />
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
            <LlamaTableFilters
              table={table}
              popoverFilterChipRef={filterChipRef}
              hasActiveFilters={hasActiveFilters}
              open={filtersOpen}
              setOpen={setFiltersOpen}
              anchorRef={filterChipRef}
              marketsQuery={mapQuery(tableQuery, d => d.markets)}
              resetFilters={resetFilters}
              {...filterProps}
            />
          }
          sortChip={isMobile && <MarketSortDrawer onSortingChange={onSortingChange} sortField={sortField} />}
          chips={<LlamaListChips hasFavorites={hasFavorites} {...filterProps} />}
        />
      </DataTable>
    </Stack>
  )
}
