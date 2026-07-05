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
import { LegacyPoolListChips } from './chips/LegacyPoolListChips'
import { LEGACY_POOL_LIST_COLUMNS, LegacyPoolColumnId, getLegacyDefaultSort } from './columns'
import { LegacyPoolListEmptyState } from './components/LegacyPoolListEmptyState'
import {
  LegacyPoolMobileExpandedPanel,
  LegacyPoolMobileExpandedPanelFooter,
} from './components/LegacyPoolMobileExpandedPanel'
import { useLegacyPoolListData } from './hooks/useLegacyPoolListData'
import { useLegacyPoolListVisibilitySettings } from './hooks/useLegacyPoolListVisibilitySettings'
import { useLegacyPoolsGlobalFilterFn } from './legacyPoolsGlobalFilter'

const LOCAL_STORAGE_KEY = 'dex-pool-list'

const PER_PAGE = 50

export const LegacyPoolListTable = ({ network }: { network: NetworkConfig }) => {
  const { isLite, poolFilters } = network

  const { data, isLoading, userHasPositions } = useLegacyPoolListData(network)

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    {
      columns: LegacyPoolColumnId,
    },
  )
  const globalFilterFn = useLegacyPoolsGlobalFilterFn(data ?? [], globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(getLegacyDefaultSort(isLite))
  const [pagination, onPaginationChange] = usePageFromQueryString(PER_PAGE)
  const { columnSettings, columnVisibility, sortField } = useLegacyPoolListVisibilitySettings(LOCAL_STORAGE_KEY, {
    isLite,
    sorting,
  })
  // eslint-disable-next-line @eslint-react/use-state -- Existing violation before enabling this rule.
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useTable({
    columns: LEGACY_POOL_LIST_COLUMNS,
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
          <LegacyPoolListEmptyState columnFiltersById={columnFiltersById} resetFilters={resetFilters} />
        </EmptyStateRow>
      }
      expandedPanel={{ body: LegacyPoolMobileExpandedPanel, footer: LegacyPoolMobileExpandedPanelFooter }}
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
          <LegacyPoolListChips
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
