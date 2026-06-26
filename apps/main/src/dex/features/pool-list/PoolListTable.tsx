import { useRef, useState } from 'react'
import type { NetworkConfig } from '@/dex/types/main.types'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { type ExpandedState, getCoreRowModel, getExpandedRowModel } from '@tanstack/react-table'
import { CURVE_SOCIALS } from '@ui/utils'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@ui-kit/shared/ui/DataTable/TableFiltersChip'
import { POOL_LIST_COLUMNS, PoolListColumnId } from './columns'
import { PoolListMobileExpandedPanel } from './components/PoolListMobileExpandedPanel'
import { PoolListSortDrawer } from './drawers/PoolListSortDrawer'
import { PoolListFiltersCollapsible } from './filters/PoolListFiltersCollapsible'
import { PoolListFiltersOverlay } from './filters/PoolListFiltersOverlay'
import { usePoolListFilterControls } from './hooks/usePoolListFilterControls'
import { usePoolListFilters } from './hooks/usePoolListFilters'
import { usePoolListPagination } from './hooks/usePoolListPagination'
import { usePoolListSorting } from './hooks/usePoolListSorting'
import { usePoolListTable } from './hooks/usePoolListTable'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const isMobile = useIsMobile()
  const [filtersOpen, , , , setFiltersOpen] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const { onPaginationChange, pagination, updateQueryAndResetPage } = usePoolListPagination()
  const { apiParams, filterProps, hasActiveFilters, onSearch, resetFilters, searchText } =
    usePoolListFilters(updateQueryAndResetPage)
  const { appliedFilterProps, draftFilterProps, resetPoolFilters } = usePoolListFilterControls({
    filterProps,
    resetFilters,
  })
  const { onSortingChange, sortBy, sortDirection, sortField, sorting, sortOptions } = usePoolListSorting(
    network.isLite,
    updateQueryAndResetPage,
  )

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite: network.isLite,
    sorting,
  })

  const { pageCount, userHasPositions, tableQuery } = usePoolListTable({
    filters: apiParams,
    network,
    page: pagination.pageIndex + 1,
    searchText,
    sortBy,
    sortDirection,
  })

  const table = useTable({
    columns: POOL_LIST_COLUMNS,
    query: tableQuery,
    state: { expanded, sorting, pagination, columnVisibility },
    onExpandedChange: setExpanded,
    onPaginationChange,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    autoResetPageIndex: false,
  })

  return (
    <Stack>
      <CardHeader title={t`Pools`} />
      <DataTable
        table={table}
        emptyState={{
          title: t`Can't find what you're looking for?`,
          description: t`Try adjusting your filters or search query. Or feel free to ask us on Telegram.`,
          button: { label: t`Show all pools`, onClick: resetPoolFilters, testId: 'dex-pool-empty-state-reset' },
          secondaryButton: { label: t`Telegram`, href: CURVE_SOCIALS.telegram.en },
        }}
        errorState={{ title: t`Unable to retrieve pool list` }}
        expandedPanel={PoolListMobileExpandedPanel}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      >
        <TableFilters<PoolListColumnId>
          testIdPrefix={LOCAL_STORAGE_KEY}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          searchText={searchText}
          onSearch={onSearch}
          collapsibleFilters={{
            collapsible: (
              <PoolListFiltersCollapsible
                hasActiveFilters={hasActiveFilters}
                resetFilters={resetPoolFilters}
                {...appliedFilterProps}
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
              <PoolListSortDrawer onSortingChange={onSortingChange} options={sortOptions} sortField={sortField} />
            )
          }
        />
      </DataTable>
      {/* Keep the overlay outside DataTable children because DataTable remounts them when switching sticky header layout. */}
      <PoolListFiltersOverlay
        anchorRef={filterChipRef}
        hasActiveFilters={hasActiveFilters}
        open={filtersOpen}
        resetFilters={resetPoolFilters}
        setOpen={setFiltersOpen}
        {...draftFilterProps}
      />
    </Stack>
  )
}
