import { useRef, useState } from 'react'
import { ROUTE } from '@/dex/constants'
import type { NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import type { ExpandedState } from '@tanstack/react-table'
import { CURVE_SOCIALS } from '@ui/utils'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { copyToClipboardWithToast } from '@ui-kit/hooks/useCopyToClipboard'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { type ExpandedPanelActionResolver } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersChip } from '@ui-kit/shared/ui/DataTable/TableFiltersChip'
import { TableFiltersOverlay } from '@ui-kit/shared/ui/DataTable/TableFiltersOverlay'
import { TableHeader } from '@ui-kit/shared/ui/DataTable/TableHeader'
import { TableSortDrawer } from '@ui-kit/shared/ui/DataTable/TableSortDrawer'
import { POOL_LIST_COLUMNS, PoolListColumnId } from './columns'
import { PoolListMobileExpandedPanel } from './components/PoolListMobileExpandedPanel'
import { PoolListFilters } from './filters/PoolListFilters'
import { PoolListFiltersCollapsible } from './filters/PoolListFiltersCollapsible'
import { usePoolListFilters } from './hooks/usePoolListFilters'
import { usePoolListPagination } from './hooks/usePoolListPagination'
import { usePoolListSorting } from './hooks/usePoolListSorting'
import { usePoolListTable } from './hooks/usePoolListTable'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'
import type { PoolListItem } from './poolList.types'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

const getPoolListMobileExpandedPanelActions: ExpandedPanelActionResolver<PoolListItem> = ({ row }) => {
  const pool = row.original
  const path = getPath({ network: pool.network }, `${ROUTE.PAGE_POOLS}/${pool.address}`)

  return [
    {
      id: 'deposit',
      label: t`Deposit`,
      href: path + ROUTE.PAGE_POOL_DEPOSIT,
      testId: 'pool-link-deposit',
    },
    { id: 'withdraw', label: t`Withdraw`, href: path + ROUTE.PAGE_POOL_WITHDRAW },
    { id: 'swap', label: t`Swap`, href: path + ROUTE.PAGE_SWAP },
    {
      id: 'copy-pool-address',
      label: t`Copy pool address`,
      onClick: () =>
        void copyToClipboardWithToast({
          copyText: pool.address,
          confirmationText: t`Pool address copied`,
          failureText: t`Failed to copy pool address`,
        }),
      testId: `copy-pool-address-${pool.address}`,
      alwaysInKebabMenu: true,
    },
  ]
}

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const isMobile = useIsMobile()
  const [filtersOpen, , , , setFiltersOpen] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const { onPaginationChange, pagination, updateQueryAndResetPage } = usePoolListPagination()
  const { globalFilter, columnFilters, apiParams, filterProps, onSearch, resetFilters, searchText } =
    usePoolListFilters()
  const { onSortingChange, sortBy, sortDirection, sortField, sorting, sortOptions } = usePoolListSorting(
    network.isLite,
    updateQueryAndResetPage,
  )

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite: network.isLite,
    sorting,
  })

  const { isFetching, onReload, pageCount, userHasPositions, tableQuery } = usePoolListTable({
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
        expandedPanel={{ Body: PoolListMobileExpandedPanel, getActions: getPoolListMobileExpandedPanelActions }}
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
        <PoolListFilters {...filterProps} />
      </TableFiltersOverlay>
    </Stack>
  )
}
