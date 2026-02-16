import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { PositionsEmptyState } from '@/llamalend/constants'
import { ExpandedState } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { useGlobalFilter } from '@ui-kit/shared/ui/DataTable/hooks/useGlobalFilter'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { MarketRateType } from '@ui-kit/types/market'
import type { LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { LlamaChainFilterChips } from './chips/LlamaChainFilterChips'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY } from './columns'
import { LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns'
import { llamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { UserPositionsEmptyState } from './UserPositionsEmptyState'

const { isEqual } = lodash

const LOCAL_STORAGE_KEYS = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
}

const DEFAULT_SORT = {
  [MarketRateType.Borrow]: DEFAULT_SORT_BORROW,
  [MarketRateType.Supply]: DEFAULT_SORT_SUPPLY,
}

const SORT_QUERY_FIELD = {
  [MarketRateType.Borrow]: 'userSortBorrow',
  [MarketRateType.Supply]: 'userSortSupply',
}

const getEmptyState = (isError: boolean, hasPositions: boolean): PositionsEmptyState =>
  isError ? PositionsEmptyState.Error : hasPositions ? PositionsEmptyState.Filtered : PositionsEmptyState.NoPositions

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserHasPositions, value: type }], [type])

export type UserPositionsTableProps = {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
  loading: boolean
  tab: MarketRateType
}

const pagination = { pageIndex: 0, pageSize: 50 }
const DEFAULT_VISIBLE_ROWS = 3

export const UserPositionsTable = ({ onReload, result, loading, isError, tab }: UserPositionsTableProps) => {
  const { markets: data = [], userHasPositions } = result ?? {}
  const userData = useMemo(() => data.filter((market) => market.userHasPositions?.[tab]), [data, tab])

  const defaultFilters = useDefaultUserFilter(tab)
  const title = LOCAL_STORAGE_KEYS[tab]
  const { columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useColumnFilters({
    title,
    columns: LlamaMarketColumnId,
    defaultFilters,
    scope: tab.toLowerCase(),
  })
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT[tab], SORT_QUERY_FIELD[tab])
  const { columnSettings, columnVisibility, sortField, toggleVisibility } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const { globalFilter, setGlobalFilter } = useGlobalFilter('search-user-positions')
  const filterProps = { columnFiltersById, setColumnFilter, defaultFilters }

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    data: userData,
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    globalFilterFn: llamaGlobalFilterFn,
    ...getTableOptions(result),
  })

  return (
    <DataTable
      table={table}
      rowLimit={DEFAULT_VISIBLE_ROWS}
      viewAllLabel="View all positions"
      emptyState={
        <UserPositionsEmptyState
          state={getEmptyState(isError, userData.length > 0)}
          table={table}
          tab={tab}
          onReload={onReload}
          resetFilters={resetFilters}
        />
      }
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={loading}
    >
      <TableFilters<LlamaMarketColumnId>
        filterExpandedKey={title}
        leftChildren={
          <TableSearchField
            value={globalFilter}
            onChange={setGlobalFilter}
            testId={`${title}-search`}
            isExpanded
          />
        }
        loading={loading}
        onReload={onReload}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        collapsible={<LendingMarketsFilters data={userData} {...filterProps} />}
        chips={
          <>
            <LlamaChainFilterChips data={userData} {...filterProps} />
            <LlamaListChips
              hiddenMarketCount={result ? userData.length - table.getFilteredRowModel().rows.length : undefined}
              hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
              resetFilters={resetFilters}
              userHasPositions={userHasPositions}
              onSortingChange={onSortingChange}
              sortField={sortField}
              data={userData}
              userPositionsTab={tab}
              {...filterProps}
            />
          </>
        }
      />
    </DataTable>
  )
}
