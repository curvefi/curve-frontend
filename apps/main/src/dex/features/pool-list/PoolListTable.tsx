import { useCallback, useMemo, useState } from 'react'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { type NetworkConfig } from '@/dex/types/main.types'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ExpandedState, getPaginationRowModel } from '@tanstack/react-table'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { HideSmallPoolsSwitch } from '@ui-kit/features/user-profile/settings/HideSmallPoolsSwitch'
import { MIN_POOLS_DISPLAYED, SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { serializeRangeFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { useGlobalFilter } from '@ui-kit/shared/ui/DataTable/hooks/useGlobalFilter'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { minCutoffForTopK } from '@ui-kit/utils'
import { PoolListChips } from './chips/PoolListChips'
import { DEFAULT_SORT } from './columns'
import { POOL_LIST_COLUMNS, PoolColumnId } from './columns'
import { PoolListEmptyState } from './components/PoolListEmptyState'
import { PoolMobileExpandedPanel } from './components/PoolMobileExpandedPanel'
import { usePoolListData } from './hooks/usePoolListData'
import { usePoolListVisibilitySettings } from './hooks/usePoolListVisibilitySettings'
import { poolsGlobalFilterFn } from './poolsGlobalFilter'
import { type PoolListItem } from './types'

const { Spacing } = SizesAndSpaces

const LOCAL_STORAGE_KEY = 'dex-pool-list'

const useDefaultPoolsFilter = (data: PoolListItem[] | undefined) => {
  const hideSmallPools = useUserProfileStore((s) => s.hideSmallPools)
  const { hideSmallPoolsTvl: minTvl = SMALL_POOL_TVL } = useNetworkFromUrl() ?? {}
  return useMemo(
    () =>
      notFalsy(
        data &&
          hideSmallPools && {
            id: PoolColumnId.Tvl,
            value: serializeRangeFilter([
              minCutoffForTopK(data, (pool) => +(pool.tvl?.value ?? 0), minTvl, MIN_POOLS_DISPLAYED),
              null, // no upper limit
            ])!,
          },
      ),
    [data, minTvl, hideSmallPools],
  )
}

const PER_PAGE = 50
const EMPTY: never[] = []

export const PoolListTable = ({ network }: { network: NetworkConfig }) => {
  const { isLite, poolFilters } = network

  // todo: use isReady to show a loading spinner close to the data
  const { data, isLoading, isReady, userHasPositions } = usePoolListData(network)

  const defaultFilters = useDefaultPoolsFilter(data)
  const { globalFilter, setGlobalFilter, resetGlobalFilter } = useGlobalFilter()
  const {
    columnFilters,
    columnFiltersById,
    setColumnFilter,
    resetFilters: resetColumnFilters,
    hasFilters,
  } = useColumnFilters({
    title: LOCAL_STORAGE_KEY,
    columns: PoolColumnId,
    defaultFilters,
  })
  const resetFilters = useCallback(() => {
    resetColumnFilters()
    resetGlobalFilter()
  }, [resetColumnFilters, resetGlobalFilter])
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const [pagination, onPaginationChange] = usePageFromQueryString(PER_PAGE)
  const { columnSettings, columnVisibility, sortField } = usePoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite,
    sorting,
  })
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter, defaultFilters }

  const table = useTable({
    columns: POOL_LIST_COLUMNS,
    data: data ?? EMPTY,
    state: { expanded, sorting, columnVisibility, columnFilters, pagination, globalFilter },
    onSortingChange,
    onExpandedChange,
    onPaginationChange,
    globalFilterFn: poolsGlobalFilterFn,
    ...getTableOptions(data),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const resultCount = table.getFilteredRowModel().rows.length
  return (
    <DataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <PoolListEmptyState columnFiltersById={columnFiltersById} resetFilters={resetFilters} />
        </EmptyStateRow>
      }
      expandedPanel={PoolMobileExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={isLoading}
    >
      <TableFilters<PoolColumnId>
        filterExpandedKey={LOCAL_STORAGE_KEY}
        leftChildren={<TableFiltersTitles title={t`Pools`} subtitle={t`Find your next opportunity`} />}
        loading={!isReady}
        visibilityGroups={columnSettings}
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        hasSearchBar
        chips={
          <>
            <PoolListChips
              poolFilters={poolFilters}
              hiddenMarketCount={data ? data.length - resultCount : 0}
              hasFilters={hasFilters}
              resetFilters={resetFilters}
              onSortingChange={onSortingChange}
              sortField={sortField}
              searchText={globalFilter}
              onSearch={setGlobalFilter}
              resultCount={data ? resultCount : undefined}
              {...filterProps}
            />
            {/** Temporary switch just for feature parity with the old pools list, should be a proper range filter later. */}
            <Stack direction="row" spacing={Spacing.sm} alignItems="center">
              <HideSmallPoolsSwitch />
              <Typography variant="bodyMBold" color="text.secondary">
                {t`Hide Small Pools`}
              </Typography>
            </Stack>
          </>
        }
      />
    </DataTable>
  )
}
