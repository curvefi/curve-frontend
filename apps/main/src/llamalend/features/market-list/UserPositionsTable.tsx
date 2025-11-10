import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { useShowAllPositionsRows } from '@/llamalend/hooks/useShowAllPositionsRows'
import { ColumnFiltersState, ExpandedState, useReactTable } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { MarketRateType } from '@ui-kit/types/market'
import { type LlamaMarketsResult } from '../../entities/llama-markets'
import { ChainFilterChip } from './chips/ChainFilterChip'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId, PositionsEmptyState } from './columns.enum'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { UserPositionsEmptyState } from './UserPositionsEmptyState'
import { UserPositionsViewAllButton } from './UserPositionsViewAllButton'
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

const getEmptyState = (isError: boolean, hasPositions: boolean): PositionsEmptyState => {
  if (isError) return PositionsEmptyState.Error
  if (!hasPositions) return PositionsEmptyState.Positions
  return PositionsEmptyState.Filtered
}

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserHasPositions, value: type }], [type])

export type UserPositionsTableProps = {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
  loading: boolean
  tab: MarketRateType
}

const migration: MigrationOptions<ColumnFiltersState> = { version: 1 }
const pagination = { pageIndex: 0, pageSize: 50 }
const DEFAULT_VISIBLE_ROWS = 3

export const UserPositionsTable = ({ onReload, result, loading, isError, tab }: UserPositionsTableProps) => {
  const { markets: data = [], userHasPositions } = result ?? {}
  const userData = useMemo(() => data.filter((market) => market.userHasPositions?.[tab]), [data, tab])
  const [isShowingAll, showAllRows] = useShowAllPositionsRows(tab)

  const defaultFilters = useDefaultUserFilter(tab)
  const title = LOCAL_STORAGE_KEYS[tab]
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(
    title,
    migration,
    defaultFilters,
  )
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT[tab], SORT_QUERY_FIELD[tab])
  const { columnSettings, columnVisibility, sortField, toggleVisibility } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data: userData,
    state: { expanded, sorting, columnVisibility, columnFilters },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(result),
  })

  const showViewAllButton = userData.length > DEFAULT_VISIBLE_ROWS && !isShowingAll
  return (
    <>
      <DataTable
        table={table}
        rowLimit={isShowingAll ? undefined : DEFAULT_VISIBLE_ROWS}
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
            <TableSearchField value={searchText} onChange={onSearch} testId={`${title}-search`} isExpanded />
          }
          loading={loading}
          onReload={onReload}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          searchText={searchText}
          onSearch={onSearch}
          collapsible={
            <LendingMarketsFilters
              data={userData}
              columnFilters={columnFiltersById}
              setColumnFilter={setColumnFilter}
            />
          }
          chips={
            <>
              <ChainFilterChip data={userData} {...filterProps} />
              <LlamaListChips
                hiddenMarketCount={result ? userData.length - table.getFilteredRowModel().rows.length : undefined}
                hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
                resetFilters={resetFilters}
                userHasPositions={userHasPositions}
                onSortingChange={onSortingChange}
                sortField={sortField}
                data={userData}
                isUserPositions
                {...filterProps}
              />
            </>
          }
        />
      </DataTable>
      {showViewAllButton && <UserPositionsViewAllButton onClick={showAllRows} />}
    </>
  )
}
