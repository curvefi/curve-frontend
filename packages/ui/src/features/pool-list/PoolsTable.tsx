import { useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { ExpandedState } from '@tanstack/react-table'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'
import { POOL_COLUMNS, PoolColumnId } from '@ui/features/pool-list/columns'
import { PoolExpandedPanel } from '@ui/features/pool-list/components/PoolExpandedPanel'
import { PoolsFilters } from '@ui/features/pool-list/filters/PoolsFilters'
import { PoolsFiltersCollapsible } from '@ui/features/pool-list/filters/PoolsFiltersCollapsible'
import type { usePoolsFilters } from '@ui/features/pool-list/hooks/usePoolsFilters'
import { usePoolsGlobalFilterFn } from '@ui/features/pool-list/hooks/usePoolsGlobalFilter'
import type { usePoolsPagination } from '@ui/features/pool-list/hooks/usePoolsPagination'
import type { usePoolsSorting } from '@ui/features/pool-list/hooks/usePoolsSorting'
import { usePoolsVisibility } from '@ui/features/pool-list/hooks/usePoolsVisibility'
import { getPoolTableMeta, createPoolTableMeta } from '@ui/features/pool-list/table-meta'
import type { PoolRow, PoolsTableData, PoolTableMeta } from '@ui/features/pool-list/types'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { DataTable } from '@ui/features/tables/DataTable'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { TableFilters } from '@ui/features/tables/TableFilters'
import { TableFiltersChip } from '@ui/features/tables/TableFiltersChip'
import { TableFiltersOverlay } from '@ui/features/tables/TableFiltersOverlay'
import { TableHeader } from '@ui/features/tables/TableHeader'
import { TableSortDrawer } from '@ui/features/tables/TableSortDrawer'
import { TableVisibilitySettingsPopover } from '@ui/features/tables/TableVisibilitySettingsPopover'
import { useIsMobile, useIsTablet } from '@ui/hooks/useBreakpoints'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

const LOCAL_STORAGE_KEY = 'dex-pool-list'
const EMPTY_POOL_ROWS: readonly PoolRow[] = []

type PoolsTableProps = PoolsTableData &
  ConnectionProps &
  Pick<PoolTableMeta, 'addressDisplay' | 'crvToken'> & {
    userAddress: Address | undefined
    isLite: boolean
    filters: ReturnType<typeof usePoolsFilters>
    pagination: Pick<ReturnType<typeof usePoolsPagination>, 'onPaginationChange' | 'pagination'>
    sorting: ReturnType<typeof usePoolsSorting>
    Actions: ExpandedPanelComponent<PoolRow>
  }

const PoolsExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => (
  <PoolExpandedPanel pool={row.original} meta={getPoolTableMeta(table)} />
)

export const PoolsTable = ({
  userAddress,
  isConnecting,
  isConnected,
  connect,
  isLite,
  filters: { globalFilter, columnFilters, filterProps, onSearch, resetFilters, searchText },
  pagination: { onPaginationChange, pagination },
  sorting: { onSortingChange, sortField, sorting, sortOptions },
  isFetching,
  onReload,
  pageCount,
  userHasPositions,
  tableQuery,
  alerts,
  addressDisplay,
  crvToken,
  Actions,
}: PoolsTableProps) => {
  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLTableSectionElement>(null)

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility, variant } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    variant: isLite ? 'lite' : 'full',
    mobileColumn: sortField,
  })

  const globalFilterFn = usePoolsGlobalFilterFn(
    isLite ? (tableQuery?.data ?? EMPTY_POOL_ROWS) : EMPTY_POOL_ROWS,
    globalFilter,
  )

  const table = useCurveTable({
    columns: POOL_COLUMNS,
    query: tableQuery,
    meta: createPoolTableMeta({ getRowHref: ({ url }) => url, variant, alerts, addressDisplay, crvToken }),
    state: { expanded, sorting, columnVisibility, globalFilter, ...(!isLite && { pagination, columnFilters }) },
    getRowId: row => row.address,
    onExpandedChange: setExpanded,
    ...(!isLite && { onPaginationChange }),
    onSortingChange,
    manualPagination: true,
    manualSorting: !isLite,
    manualFiltering: !isLite,
    pageCount: isLite ? 1 : pageCount,
    ...(isLite && { globalFilterFn }),
  })

  const hasActiveFilters = !!table.state.columnFilters.length || !!table.state.globalFilter

  return (
    <Stack>
      <TableHeader
        title={t`Pools`}
        onReload={onReload}
        isLoading={isFetching}
        visibilitySettings={{ isOpen: visibilitySettingsOpen, open: openVisibilitySettings }}
      />
      <DataTable
        userAddress={userAddress}
        isConnecting={isConnecting}
        isConnected={isConnected}
        connect={connect}
        table={table}
        anchorRef={anchorRef}
        emptyState={{
          ...(hasActiveFilters
            ? {
                title: t`Can't find what you're looking for?`,
                description: t`Try adjusting your filters or search query. Or feel free to ask us on Telegram.`,
                button: { label: t`Show all pools`, onClick: resetFilters, testId: 'dex-pool-empty-state-reset' },
              }
            : {
                title: t`We couldn't find any results.`,
                description: t`If this is unexpected, feel free to ask us on Telegram.`,
                testId: 'dex-pool-empty-state-no-results',
              }),
          secondaryButton: { label: t`Telegram`, href: CURVE_SOCIALS.telegram.en },
        }}
        errorState={{ title: t`Unable to retrieve pool list`, description: tableQuery.error?.message, onReload }}
        expandedPanel={{ Body: PoolsExpandedPanel, Actions }}
        shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      >
        <TableFilters
          testIdPrefix={LOCAL_STORAGE_KEY}
          searchText={searchText}
          onSearch={onSearch}
          collapsibleFilters={
            isLite
              ? undefined
              : {
                  collapsible: (
                    <PoolsFiltersCollapsible
                      hasActiveFilters={hasActiveFilters}
                      resetFilters={resetFilters}
                      {...filterProps}
                    />
                  ),
                  hasActiveFilters,
                }
          }
          filterChip={
            !isLite && (
              <TableFiltersChip
                popoverFilterChipRef={filterChipRef}
                open={filtersOpen}
                setOpen={setFiltersOpen}
                testId="btn-open-filters-dex-pools"
              />
            )
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
      <TableVisibilitySettingsPopover<PoolColumnId>
        anchorRef={anchorRef}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        open={visibilitySettingsOpen}
        onClose={closeVisibilitySettings}
      />
      {!isLite && (
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
      )}
    </Stack>
  )
}
