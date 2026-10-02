import { useRef, useState } from 'react'
import type { NetworkConfig } from '@/dex/types/main.types'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { EvmDataTable } from '@evm-ui/shared/ui/DataTable/EvmDataTable'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { ExpandedState } from '@tanstack/react-table'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
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
import { POOL_COLUMNS, PoolColumnId } from './columns'
import { PoolExpandedPanel } from './components/PoolExpandedPanel'
import { PoolsFilters } from './filters/PoolsFilters'
import { PoolsFiltersCollapsible } from './filters/PoolsFiltersCollapsible'
import { usePoolsFilters } from './hooks/usePoolsFilters'
import { usePoolsGlobalFilterFn } from './hooks/usePoolsGlobalFilter'
import { usePoolsPagination } from './hooks/usePoolsPagination'
import { usePoolsSorting } from './hooks/usePoolsSorting'
import { usePoolsTable } from './hooks/usePoolsTable'
import { usePoolsVisibility } from './hooks/usePoolsVisibility'
import { getPoolTableMeta, createPoolTableMeta } from './table-meta'
import type { PoolRow } from './types'

const LOCAL_STORAGE_KEY = 'dex-pool-list'
const EMPTY_POOL_ROWS: readonly PoolRow[] = []

const FullPoolExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => (
  <PoolExpandedPanel
    pool={row.original}
    variant="full"
    addressDisplay={getPoolTableMeta(table).addressDisplay}
    crvToken={getPoolTableMeta(table).crvToken}
  />
)

const LitePoolExpandedPanel: ExpandedPanelComponent<PoolRow> = ({ row, table }) => (
  <PoolExpandedPanel
    pool={row.original}
    variant="lite"
    addressDisplay={getPoolTableMeta(table).addressDisplay}
    crvToken={getPoolTableMeta(table).crvToken}
  />
)

export const PoolsTable = ({
  network,
  Actions,
}: {
  network: NetworkConfig
  Actions: ExpandedPanelComponent<PoolRow>
}) => {
  const isLite = isLiteChain(network.chainId)
  const isMobile = useIsMobile()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibilitySettingsOpen, openVisibilitySettings, closeVisibilitySettings] = useSwitch(false)
  const filterChipRef = useRef<HTMLDivElement>(null)
  const visibilitySettingsRef = useRef<HTMLButtonElement>(null)
  const { onPaginationChange, pagination, updateQueryAndResetPage } = usePoolsPagination()
  const { globalFilter, columnFilters, apiParams, filterProps, onSearch, resetFilters, searchText } = usePoolsFilters()
  const { onSortingChange, sortBy, sortDirection, sortField, sorting, sortOptions } = usePoolsSorting(
    isLite,
    updateQueryAndResetPage,
  )

  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { columnSettings, columnVisibility, toggleVisibility, variant } = usePoolsVisibility(LOCAL_STORAGE_KEY, {
    variant: isLite ? 'lite' : 'full',
    mobileColumn: sortField,
  })

  const { isFetching, onReload, pageCount, userHasPositions, tableQuery, alerts } = usePoolsTable({
    filters: isLite ? {} : apiParams,
    network,
    page: pagination.pageIndex + 1,
    searchText,
    sortBy,
    sortDirection,
  })

  const globalFilterFn = usePoolsGlobalFilterFn(
    isLite ? (tableQuery?.data ?? EMPTY_POOL_ROWS) : EMPTY_POOL_ROWS,
    globalFilter,
  )

  const table = useCurveTable({
    columns: POOL_COLUMNS,
    query: tableQuery,
    meta: createPoolTableMeta({
      getRowHref: ({ url }) => url,
      variant,
      alerts,
      addressDisplay: evmAddressDisplay,
      crvToken: { address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.chain },
    }),
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

  const hasActiveFilters = !isLite && !!table.state.columnFilters.length

  return (
    <Stack>
      <TableHeader
        title={t`Pools`}
        onReload={onReload}
        isLoading={isFetching}
        visibilitySettings={{
          anchorRef: visibilitySettingsRef,
          isOpen: visibilitySettingsOpen,
          open: openVisibilitySettings,
        }}
      />
      <EvmDataTable
        table={table}
        emptyState={{
          title: t`Can't find what you're looking for?`,
          description: t`Try adjusting your filters or search query. Or feel free to ask us on Telegram.`,
          button: { label: t`Show all pools`, onClick: resetFilters, testId: 'dex-pool-empty-state-reset' },
          secondaryButton: { label: t`Telegram`, href: CURVE_SOCIALS.telegram.en },
        }}
        errorState={{ title: t`Unable to retrieve pool list`, description: tableQuery.error?.message, onReload }}
        expandedPanel={{ Body: isLite ? LitePoolExpandedPanel : FullPoolExpandedPanel, Actions }}
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
      </EvmDataTable>
      <TableVisibilitySettingsPopover<PoolColumnId>
        anchorRef={visibilitySettingsRef}
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
