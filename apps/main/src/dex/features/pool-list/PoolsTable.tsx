import { useRef, useState } from 'react'
import type { NetworkConfig } from '@/dex/types/main.types'
import Stack from '@mui/material/Stack'
import type { ExpandedState } from '@tanstack/react-table'
import { CURVE_SOCIALS } from '@ui/utils'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@ui-kit/shared/ui/DataTable/TableFiltersChip'
import { TableFiltersOverlay } from '@ui-kit/shared/ui/DataTable/TableFiltersOverlay'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { TableSortDrawer } from '@ui-kit/shared/ui/DataTable/TableSortDrawer'
import { POOL_COLUMNS, PoolColumnId } from './columns'
import { PoolExpandedPanel } from './components/PoolExpandedPanel'
import { PoolExpandedPanelActions } from './components/PoolExpandedPanelActions'
import { PoolsFilters } from './filters/PoolsFilters'
import { PoolsFiltersCollapsible } from './filters/PoolsFiltersCollapsible'
import { usePoolsFilters } from './hooks/usePoolsFilters'
import { usePoolsPagination } from './hooks/usePoolsPagination'
import { usePoolsSorting } from './hooks/usePoolsSorting'
import { usePoolsTable } from './hooks/usePoolsTable'
import { usePoolsVisibility } from './hooks/usePoolsVisibility'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

export const PoolsTable = ({ network }: { network: NetworkConfig }) => {
  const isMobile = useIsMobile()
  const [filtersOpen, , , , setFiltersOpen] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const { onPaginationChange, pagination, updateQueryAndResetPage } = usePoolsPagination()
  const { globalFilter, columnFilters, apiParams, filterProps, onSearch, resetFilters, searchText } = usePoolsFilters()
  const { onSortingChange, sortBy, sortDirection, sortField, sorting, sortOptions } = usePoolsSorting(
    network.isLite,
    updateQueryAndResetPage,
  )

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    isLite: network.isLite,
    sorting,
  })

  const { isFetching, onReload, pageCount, userHasPositions, tableQuery } = usePoolsTable({
    filters: apiParams,
    network,
    page: pagination.pageIndex + 1,
    searchText,
    sortBy,
    sortDirection,
  })

  const table = useTable({
    columns: POOL_COLUMNS,
    query: tableQuery,
    state: { expanded, sorting, pagination, columnVisibility, columnFilters, globalFilter },
    onExpandedChange: setExpanded,
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    ...getTableOptions(tableQuery ? tableQuery.data : undefined),
  })

  const hasActiveFilters = !!table.getState().columnFilters.length

  return (
    <Stack>
      <TableHeader title={t`Pools`} onReload={() => void onReload()} isLoading={isFetching} />
      <DataTable
        table={table}
        emptyState={{
          title: t`Can't find what you're looking for?`,
          description: t`Try adjusting your filters or search query. Or feel free to ask us on Telegram.`,
          button: { label: t`Show all pools`, onClick: resetFilters, testId: 'dex-pool-empty-state-reset' },
          secondaryButton: { label: t`Telegram`, href: CURVE_SOCIALS.telegram.en },
        }}
        errorState={{ title: t`Unable to retrieve pool list`, onReload }}
        expandedPanel={{ Body: PoolExpandedPanel, Actions: PoolExpandedPanelActions }}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      >
        <TableFilters<PoolColumnId>
          testIdPrefix={LOCAL_STORAGE_KEY}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          searchText={searchText}
          onSearch={onSearch}
          collapsibleFilters={{
            collapsible: (
              <PoolsFiltersCollapsible
                hasActiveFilters={hasActiveFilters}
                resetFilters={resetFilters}
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
              testId="btn-open-filters-dex-pools"
            />
          }
          sortChip={
            isMobile && (
              <TableSortDrawer
                buttonTestId="btn-drawer-sort-dex-pools"
                drawerTestId="drawer-sort-menu-dex-pools"
                onSortingChange={onSortingChange}
                options={sortOptions}
                sortField={sortField}
              />
            )
          }
        />
      </DataTable>
      {/* Keep the overlay outside DataTable children because DataTable remounts them when switching sticky header layout. */}
      <TableFiltersOverlay
        anchorRef={filterChipRef}
        drawerTestId="drawer-filter-menu-dex-pools"
        hasActiveFilters={hasActiveFilters}
        open={filtersOpen}
        resetFilters={resetFilters}
        setOpen={setFiltersOpen}
        title={t`Filter pools`}
      >
        <PoolsFilters {...filterProps} />
      </TableFiltersOverlay>
    </Stack>
  )
}
