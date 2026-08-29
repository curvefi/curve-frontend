import { capitalize } from 'lodash'
import { useMemo } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { ChainFilterChips } from '@evm-ui/shared/ui/DataTable/chips/ChainFilterChips'
import type { CurveTableFeatures, FilterProps } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import {
  getRangeFilterLabel,
  parseListFilter,
  parseRangeFilter,
  rangeFilterFn,
  serializeListFilter,
} from '@evm-ui/shared/ui/DataTable/filters'
import {
  TableActiveFilterGroups,
  type TableActiveFilterGroup,
  type TableActiveFilterGroupChipsProps,
} from '@evm-ui/shared/ui/DataTable/TableActiveFilterGroups'
import { constQ } from '@evm-ui/types/util'
import type { Unit } from '@evm-ui/utils/units'
import { toArray } from '@primitives/array.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import type { ReactTable } from '@tanstack/react-table'
import { MARKET_TITLES, MarketColumnId } from '../columns'

// capitalize all labels except columns containing tokens symbols
const formatLabel = (label: string, id: MarketColumnId) =>
  [MarketColumnId.CollateralSymbol, MarketColumnId.BorrowedSymbol].includes(id) ? label : capitalize(label)

// Convert a serialized range filter (`min~max`) into a single chip label
const getRangeLabel = (serializedRange: string | undefined, unit?: Unit) => {
  const range = parseRangeFilter(serializedRange)
  return range ? getRangeFilterLabel(range, unit) : null
}

const ChainActiveFilterChips = ({ labels, onRemove }: TableActiveFilterGroupChipsProps) => (
  <ChainFilterChips chainsQuery={constQ(labels)} selectedChains={labels} toggleChain={onRemove} />
)

export const MarketsActiveFiltersChip = ({
  table,
  setColumnFilter,
  testIdPrefix,
}: {
  table: ReactTable<CurveTableFeatures, LlamaMarketRow>
  testIdPrefix: string
} & Pick<FilterProps<MarketColumnId>, 'setColumnFilter'>) => {
  const filtersState = table.state.columnFilters as { id: MarketColumnId; value: string }[]
  const marketColumnOrder = useMemo(
    () => new Map(table.getAllLeafColumns().map((column, index) => [column.id, index])),
    [table],
  )
  // Keep networks first than remaining filters in the same order as the market columns to avoid chips jumping when filters are removed.
  const sortedFiltersState = useMemo(
    () =>
      filtersState.toSorted((a, b) => {
        if (a.id === MarketColumnId.Chain) return -1
        if (b.id === MarketColumnId.Chain) return 1
        return marketColumnOrder.get(a.id)! - marketColumnOrder.get(b.id)!
      }),
    [filtersState, marketColumnOrder],
  )

  return (
    <TableActiveFilterGroups
      groups={sortedFiltersState.map(({ id, value }): TableActiveFilterGroup => {
        const column = assert(table.getColumn(id), `no column with id ${id}`)
        const isRangeFilterFn = column.getFilterFn() === rangeFilterFn
        const labels = isRangeFilterFn
          ? notFalsy(getRangeLabel(value, column.columnDef.meta?.unit))
          : parseListFilter(value)

        const removeClickedValue = (clickedValue: string | string[]) => {
          const activeValues = parseListFilter(value)
          const removedValues = new Set(toArray(clickedValue))
          const remainingValues = activeValues?.filter(v => !removedValues.has(v))
          setColumnFilter(id, serializeListFilter(remainingValues))
        }

        return {
          key: `selected-chip-${id}`,
          labels,
          onRemove: isRangeFilterFn ? () => setColumnFilter(id, null) : removeClickedValue,
          getChipLabel: label => formatLabel(label, id),
          Chips: id === MarketColumnId.Chain ? ChainActiveFilterChips : undefined,
          title: MARKET_TITLES[id],
          testId: `${testIdPrefix}-active-filter-${id}`,
        }
      })}
    />
  )
}
