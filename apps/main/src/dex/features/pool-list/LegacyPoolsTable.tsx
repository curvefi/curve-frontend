import { useState } from 'react'
import { type NetworkConfig } from '@/dex/types/main.types'
import { ExpandedState, getPaginationRowModel } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { usePageFromQueryString } from '@ui-kit/hooks/usePageFromQueryString'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getHiddenCount, getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { LegacyDataTable } from '@ui-kit/shared/ui/DataTable/LegacyDataTable'
import { LegacyTableFilters } from '@ui-kit/shared/ui/DataTable/LegacyTableFilters'
import { LegacyTableFiltersTitles } from '@ui-kit/shared/ui/DataTable/LegacyTableFiltersTitles'
import { q } from '@ui-kit/types/util'
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

  const table = useTable({
    columns: LEGACY_POOL_COLUMNS,
    query: q({ data, isLoading, error: null }),
    state: { expanded, sorting, columnVisibility, columnFilters, pagination, globalFilter },
    onSortingChange,
    onExpandedChange,
    onPaginationChange,
    globalFilterFn,
    ...getTableOptions(data),
    getPaginationRowModel: getPaginationRowModel(),
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
