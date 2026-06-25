import { capitalize } from 'lodash'
import { useMemo } from 'react'
import Stack from '@mui/material/Stack'
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
import { TableActiveFilterChip } from '@ui-kit/shared/ui/DataTable/TableActiveFilterChip'
import { TableSelectedFilterChips } from '@ui-kit/shared/ui/DataTable/TableSelectedFilterChips'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { LLAMA_MARKET_COLUMNS, LLAMA_MARKET_TITLES, LlamaMarketColumnId } from '../columns'
import { HiddenInlinedItems } from './HiddenInlinedItems'
import { getInlinedItemsVisibility } from './utils'

const { Spacing } = SizesAndSpaces

const LLAMA_MARKET_COLUMN_ORDER = new Map(LLAMA_MARKET_COLUMNS.map((column, index) => [column.id, index]))

// capitalize all labels except columns containing tokens symbols
const formatLabel = (label: string, id: LlamaMarketColumnId) =>
  [LlamaMarketColumnId.CollateralSymbol, LlamaMarketColumnId.BorrowedSymbol].includes(id) ? label : capitalize(label)

// Convert a serialized range filter (`min~max`) into a single chip label
const getRangeLabel = (serializedRange: string | undefined, unit?: ColumnMeta['unit']) => {
  const range = parseRangeFilter(serializedRange)
  return range ? getRangeFilterLabel(range, unit) : null
}

export const LlamaTableActiveFiltersChip = <T extends TableItem>({
  table,
  setColumnFilter,
  testIdPrefix,
}: {
  table: TanstackTable<T>
  testIdPrefix: string
} & Pick<FilterProps<LlamaMarketColumnId>, 'setColumnFilter'>) => {
  const filtersState = table.getState().columnFilters as { id: LlamaMarketColumnId; value: string }[]
  // Keep networks first than remaining filters in the same order as the market columns to avoid chips jumping when filters are removed.
  const sortedFiltersState = useMemo(
    () =>
      [...filtersState].sort((a, b) => {
        if (a.id === LlamaMarketColumnId.Chain) return -1
        if (b.id === LlamaMarketColumnId.Chain) return 1
        return LLAMA_MARKET_COLUMN_ORDER.get(a.id)! - LLAMA_MARKET_COLUMN_ORDER.get(b.id)!
      }),
    [filtersState],
  )

  return (
    <Stack direction="row" sx={{ gap: Spacing.sm, flexWrap: 'wrap' }}>
      {sortedFiltersState.map(({ id, value }) => {
        const column = assert(table.getColumn(id), `no column with id ${id}`)
        const isRangeFilterFn = column.getFilterFn() === rangeFilterFn
        const labels = isRangeFilterFn
          ? notFalsy(getRangeLabel(value, column.columnDef.meta?.unit))
          : parseListFilter(value)
        const [visibleLabels, hiddenLabels] = getInlinedItemsVisibility(labels)

        const removeClickedValue = (clickedValue: string | string[]) => {
          const activeValues = parseListFilter(value)
          const removedValues = new Set(toArray(clickedValue))
          const remainingValues = activeValues?.filter(v => !removedValues.has(v))
          setColumnFilter(id, serializeListFilter(remainingValues))
        }

        return (
          !!labels?.length && (
            <TableSelectedFilterChips
              key={`selected-chip-${id}`}
              title={LLAMA_MARKET_TITLES[id]}
              testId={`${testIdPrefix}-active-filter-${id}`}
            >
              {/* Special chip for the chains filter */}
              {id === LlamaMarketColumnId.Chain ? (
                <ChainFilterChips
                  chainsQuery={constQ(labels)}
                  selectedChains={labels}
                  toggleChain={removeClickedValue}
                />
              ) : (
                <>
                  {visibleLabels.map(label => (
                    <TableActiveFilterChip
                      key={`${label}-${id}`}
                      label={formatLabel(label, id)}
                      toggle={isRangeFilterFn ? () => setColumnFilter(id, null) : () => removeClickedValue(label)}
                    />
                  ))}
                  <HiddenInlinedItems
                    hiddenSelectedItemsLength={hiddenLabels.length}
                    renderItem={label => (
                      <TableActiveFilterChip label={label} toggle={() => removeClickedValue(hiddenLabels)} />
                    )}
                  />
                </>
              )}
            </TableSelectedFilterChips>
          )
        )
      })}
    </Stack>
  )
}
