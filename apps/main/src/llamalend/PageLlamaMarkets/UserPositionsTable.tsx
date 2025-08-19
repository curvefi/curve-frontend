import lodash from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { ExpandedState, useReactTable } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable, getTableModels } from '@ui-kit/shared/ui/DataTable'
import { type Option, SelectFilter } from '@ui-kit/shared/ui/DataTable/SelectFilter'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import type { MarketRateType } from '@ui-kit/types/market'
import { type LlamaMarketsResult } from '../entities/llama-markets'
import { MarketsFilterChips } from './chips/MarketsFilterChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns.enum'
import { maxMultiSortColCount, useLlamaMarketSortOptions } from './hooks/useLlamaMarketSortOptions'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const { isEqual } = lodash
const TITLE = 'User Positions' // not using the t`` here as the value is used as a key in the local storage

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserHasPosition, value: type }], [type])

export type UserPositionsTableProps = {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
  loading: boolean
}

export const UserPositionsTable = ({
  onReload,
  result,
  isError,
  loading,
  type,
}: UserPositionsTableProps & { type: MarketRateType }) => {
  const { markets: data = [], hasPositions } = result ?? {}

  const defaultFilters = useDefaultUserFilter(type)
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(TITLE, defaultFilters)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT, 'userSort')
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    TITLE,
    sorting,
    'hasPositions',
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    autoResetPageIndex: false, // autoreset causing stack too deep issues when receiving new data
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    maxMultiSortColCount,
    ...getTableModels(result),
  })

  return (
    <DataTable
      table={table}
      emptyText={isError ? t`Could not load markets` : t`No markets found`}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && hasPositions?.length)}
      loading={loading}
    >
      <TableFilters<LlamaMarketColumnId>
        title={TITLE}
        subtitle={t`Borrow with the power of Curve soft liquidations`}
        loading={loading}
        onReload={onReload}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        searchText={searchText}
        onSearch={onSearch}
        collapsible={
          <LendingMarketsFilters columnFilters={columnFiltersById} setColumnFilter={setColumnFilter} data={data} />
        }
        chips={
          <MarketsFilterChips
            searchText={searchText}
            onSearch={onSearch}
            hiddenMarketCount={result ? data.length - table.getFilteredRowModel().rows.length : 0}
            columnFiltersById={columnFiltersById}
            setColumnFilter={setColumnFilter}
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
          />
        }
        sort={
          <SelectFilter
            name="sort"
            options={useLlamaMarketSortOptions()}
            onSelected={useCallback(
              ({ id }: Option<LlamaMarketColumnId>) => onSortingChange([{ id, desc: true }]),
              [onSortingChange],
            )}
            value={sortField}
          />
        }
      />
    </DataTable>
  )
}
