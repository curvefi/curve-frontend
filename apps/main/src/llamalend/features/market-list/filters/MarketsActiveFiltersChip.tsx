import { capitalize } from 'lodash'
import { useMemo } from 'react'
import { toArray } from '@primitives/array.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import type { ColumnMeta, FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import {
  getRangeFilterLabel,
  parseListFilter,
  parseRangeFilter,
  rangeFilterFn,
  serializeListFilter,
} from '@ui-kit/shared/ui/DataTable/filters'
import {
  TableActiveFilterGroups,
  type TableActiveFilterGroup,
  type TableActiveFilterGroupChipsProps,
} from '@ui-kit/shared/ui/DataTable/TableActiveFilterGroups'
import { constQ } from '@ui-kit/types/util'
import { MARKET_COLUMNS as MARKET_COLUMNS, MARKET_TITLES, MarketColumnId } from '../columns'

const MARKET_COLUMN_ORDER = new Map(MARKET_COLUMNS.map((column, index) => [column.id, index]))

// capitalize all labels except columns containing tokens symbols
const formatLabel = (label: string, id: MarketColumnId) =>
  [MarketColumnId.CollateralSymbol, MarketColumnId.BorrowedSymbol].includes(id) ? label : capitalize(label)

// Convert a serialized range filter (`min~max`) into a single chip label
const getRangeLabel = (serializedRange: string | undefined, unit?: ColumnMeta['unit']) => {
  const range = parseRangeFilter(serializedRange)
  return range ? getRangeFilterLabel(range, unit) : null
}

const ChainActiveFilterChips = ({ labels, onRemove }: TableActiveFilterGroupChipsProps) => (
  <ChainFilterChips chainsQuery={constQ(labels)} selectedChains={labels} toggleChain={onRemove} />
)

export const MarketsActiveFiltersChip = <T extends TableItem>({
  table,
  setColumnFilter,
  testIdPrefix,
}: {
  table: TanstackTable<T>
  testIdPrefix: string
} & Pick<FilterProps<MarketColumnId>, 'setColumnFilter'>) => {
  const filtersState = table.getState().columnFilters as { id: MarketColumnId; value: string }[]
  // Keep networks first than remaining filters in the same order as the market columns to avoid chips jumping when filters are removed.
  const sortedFiltersState = useMemo(
    () =>
      filtersState.toSorted((a, b) => {
        if (a.id === MarketColumnId.Chain) return -1
        if (b.id === MarketColumnId.Chain) return 1
        return MARKET_COLUMN_ORDER.get(a.id)! - MARKET_COLUMN_ORDER.get(b.id)!
      }),
    [filtersState],
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
