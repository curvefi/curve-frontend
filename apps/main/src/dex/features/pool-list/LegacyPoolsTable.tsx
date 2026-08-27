import { useState } from 'react'
import { type NetworkConfig } from '@/dex/types/main.types'
import { useIsTablet } from '@evm-ui/hooks/useBreakpoints'
import { usePageFromQueryString } from '@evm-ui/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@evm-ui/hooks/useSortFromQueryString'
import { t } from '@evm-ui/lib/i18n'
import { getHiddenCount, useCurveTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@evm-ui/shared/ui/DataTable/EmptyStateRow'
import { useFilters } from '@evm-ui/shared/ui/DataTable/hooks/useFilters'
import { LegacyDataTable } from '@evm-ui/shared/ui/DataTable/LegacyDataTable'
import { LegacyTableFilters } from '@evm-ui/shared/ui/DataTable/LegacyTableFilters'
import { LegacyTableFiltersTitles } from '@evm-ui/shared/ui/DataTable/LegacyTableFiltersTitles'
import { q } from '@evm-ui/types/util'
import type { ExpandedState } from '@tanstack/react-table'
import { LEGACY_POOL_COLUMNS, LegacyPoolColumnId, getDefaultLegacyPoolsSort } from './columns'
import { LegacyPoolExpandedPanel } from './components/LegacyPoolExpandedPanel'
import { LegacyPoolExpandedPanelActions } from './components/LegacyPoolExpandedPanelActions'
import { LegacyPoolsEmptyState } from './components/LegacyPoolsEmptyState'
import { LegacyPoolsFilters } from './filters/LegacyPoolsFilters'
import { useLegacyPoolsGlobalFilterFn } from './hooks/useLegacyPoolsGlobalFilter'
import { useLegacyPoolsTable } from './hooks/useLegacyPoolsTable'
import { useLegacyPoolsVisibility } from './hooks/useLegacyPoolsVisibility'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

const PER_PAGE = 50

export const LegacyPoolsTable = ({ network }: { network: NetworkConfig }) => {
  const { isLite, poolFilters } = network

  const { data, isLoading, userHasPositions } = useLegacyPoolsTable(network)

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    {
      columns: LegacyPoolColumnId,
    },
  )
  const globalFilterFn = useLegacyPoolsGlobalFilterFn(data ?? [], globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(getDefaultLegacyPoolsSort(isLite))
  const [pagination, onPaginationChange] = usePageFromQueryString(PER_PAGE)
  const { columnSettings, columnVisibility, sortField } = useLegacyPoolsVisibility(LOCAL_STORAGE_KEY, {
    isLite,
    sorting,
  })
  // eslint-disable-next-line @eslint-react/use-state -- Existing violation before enabling this rule.
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useCurveTable({
    columns: LEGACY_POOL_COLUMNS,
    query: q({ data, isLoading, error: null }),
    meta: { getRowHref: ({ url }) => url },
    state: { expanded, sorting, columnVisibility, columnFilters, pagination, globalFilter },
    onSortingChange,
    onExpandedChange,
    onPaginationChange,
    globalFilterFn,
  })

  const resultCount = table.getFilteredRowModel().rows.length
  return (
    <LegacyDataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <LegacyPoolsEmptyState columnFiltersById={columnFiltersById} resetFilters={resetFilters} />
        </EmptyStateRow>
      }
      expandedPanel={{
        Body: LegacyPoolExpandedPanel,
        Actions: LegacyPoolExpandedPanelActions,
      }}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={isLoading}
    >
      <LegacyTableFilters<LegacyPoolColumnId>
        filterExpandedKey={LOCAL_STORAGE_KEY}
        leftChildren={<LegacyTableFiltersTitles title={t`Pools`} subtitle={t`Find your next opportunity`} />}
        loading={isLoading}
        visibilityGroups={columnSettings}
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        hasSearchBar
        chips={
          <LegacyPoolsFilters
            poolFilters={poolFilters}
            hiddenCount={getHiddenCount(table)}
            resetFilters={resetFilters}
            onSortingChange={onSortingChange}
            sortField={sortField}
            searchText={globalFilter}
            onSearch={setGlobalFilter}
            resultCount={data ? resultCount : undefined}
            {...filterProps}
          />
        }
      />
    </LegacyDataTable>
  )
}
