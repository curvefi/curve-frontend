import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { ExpandedState, useReactTable } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable, getTableOptions } from '@ui-kit/shared/ui/DataTable'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { MarketRateType } from '@ui-kit/types/market'
import { type LlamaMarketsResult } from '../entities/llama-markets'
import { MarketFilterChipWrapper } from './chips/MarketFilterChipWrapper'
import { UserPositionFilterChips } from './chips/UserPositionFilterChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from './columns'
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

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserPositions, value: type }], [type])

export type UserPositionsTableProps = {
  result: LlamaMarketsResult | undefined
  loading: boolean
  tab: MarketRateType
}

export const UserPositionsTable = ({ result, loading, tab }: UserPositionsTableProps) => {
  const { markets: data = [], userPositions } = result ?? {}
  const defaultFilters = useDefaultUserFilter(tab)
  const title = TITLES[tab]
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(title, defaultFilters)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT, 'userSort')
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
      emptyText={t`No positions found`}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userPositions)}
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
              userPositions={userPositions}
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
