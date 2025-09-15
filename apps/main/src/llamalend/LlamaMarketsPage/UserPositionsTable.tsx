import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { ColumnFiltersState, ExpandedState, useReactTable } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { MarketRateType } from '@ui-kit/types/market'
import { type LlamaMarketsResult } from '../entities/llama-markets'
import { MarketFilterChipWrapper } from './chips/MarketFilterChipWrapper'
import { UserPositionFilterChips } from './chips/UserPositionFilterChips'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns.enum'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { LlamaMarketSort } from './LlamaMarketSort'

const { isEqual } = lodash
const TITLES = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
}

const DEFAULT_SORT = {
  [MarketRateType.Borrow]: DEFAULT_SORT_BORROW,
  [MarketRateType.Supply]: DEFAULT_SORT_SUPPLY,
}

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserHasPositions, value: type }], [type])

export type UserPositionsTableProps = {
  result: LlamaMarketsResult | undefined
  loading: boolean
  tab: MarketRateType
}

const migration: MigrationOptions<ColumnFiltersState> = { version: 1 }

export const UserPositionsTable = ({ result, loading, tab }: UserPositionsTableProps) => {
  const { markets: data = [], userHasPositions } = result ?? {}
  const defaultFilters = useDefaultUserFilter(tab)
  const title = TITLES[tab]
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(
    title,
    migration,
    defaultFilters,
  )
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT[tab], 'userSort')
  const { columnSettings, columnVisibility, sortField } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(result),
  })
  return (
    <DataTable
      table={table}
      emptyState={<EmptyStateRow size="sm" table={table}>{t`No positions found`}</EmptyStateRow>}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={loading}
    >
      <TableFilters<LlamaMarketColumnId>
        title={title}
        loading={loading}
        visibilityGroups={columnSettings}
        searchText={searchText}
        onSearch={onSearch}
        chips={
          <MarketFilterChipWrapper
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
          >
            <UserPositionFilterChips
              columnFiltersById={columnFiltersById}
              setColumnFilter={setColumnFilter}
              userHasPositions={userHasPositions}
              tab={tab}
              searchText={searchText}
              onSearch={onSearch}
            />
          </MarketFilterChipWrapper>
        }
        sort={<LlamaMarketSort onSortingChange={onSortingChange} sortField={sortField} />}
      />
    </DataTable>
  )
}
