import { capitalize } from 'lodash'
import { useMemo } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { toArray } from '@primitives/array.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import type { ColumnMeta, FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import {
  parseListFilter,
  parseRangeFilter,
  rangeFilterFn,
  serializeListFilter,
} from '@ui-kit/shared/ui/DataTable/filters'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { Unit } from '@ui-kit/utils/units'
import { LLAMA_MARKET_COLUMNS, LLAMA_MARKET_TITLES, LlamaMarketColumnId } from '../columns'
import { HiddenInlinedItems } from './HiddenInlinedItems'
import { SelectedFilterChips } from './SelectedFilterChips'
import { getInlinedItemsVisibility } from './utils'

const { Spacing } = SizesAndSpaces

const LLAMA_MARKET_COLUMN_ORDER = new Map(LLAMA_MARKET_COLUMNS.map((column, index) => [column.id, index]))

const formatRangeValue = (value: number, unit?: Unit) =>
  formatNumber(value, { abbreviate: true, ...(unit && { unit }) })

// capitalize all labels except columns containing tokens symbols
const formatLabel = (label: string, id: LlamaMarketColumnId) =>
  [LlamaMarketColumnId.CollateralSymbol, LlamaMarketColumnId.BorrowedSymbol].includes(id) ? label : capitalize(label)

// Convert a serialized range filter (`min~max`) into a single chip label
const getRangeLabel = (serializedRange: string | undefined, unit?: ColumnMeta['unit']) => {
  const [min, max] = parseRangeFilter(serializedRange) ?? []

  if ((min == null || min === 0) && max != null) return `<${formatRangeValue(max, unit)}`
  if (min != null && max == null) return `>${formatRangeValue(min, unit)}`
  if (min != null && max != null) return `${formatRangeValue(min, unit)} - ${formatRangeValue(max, unit)}`

  return null
}

const ActiveFilterChip = ({ label, toggle }: { label: string; toggle: () => void }) => (
  <SelectableChip selected toggle={toggle} label={label} aria-label={label} />
)

export const LlamaTableFiltersCollapsible = <T extends TableItem>({
  table,
  resetFilters,
  setColumnFilter,
}: {
  table: TanstackTable<T>
  resetFilters: () => void
} & FilterProps<LlamaMarketColumnId>) => {
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
    <Stack
      paddingBlock={Spacing.xs}
      paddingInline={Spacing.sm}
      direction="row"
      alignItems="end"
      gap={Spacing.sm}
      justifyContent="space-between"
      sx={{ borderTop: t => `1px solid ${t.design.Layer[1].Outline}` }}
    >
      <Stack direction="row" gap={Spacing.sm} flexWrap="wrap">
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
              <SelectedFilterChips key={`selected-chip-${id}`} title={LLAMA_MARKET_TITLES[id]}>
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
                      <ActiveFilterChip
                        key={`${label}-${id}`}
                        label={formatLabel(label, id)}
                        toggle={isRangeFilterFn ? () => setColumnFilter(id, null) : () => removeClickedValue(label)}
                      />
                    ))}
                    <HiddenInlinedItems
                      hiddenSelectedItemsLength={hiddenLabels.length}
                      renderItem={label => (
                        <ActiveFilterChip label={label} toggle={() => removeClickedValue(hiddenLabels)} />
                      )}
                    />
                  </>
                )}
              </SelectedFilterChips>
            )
          )
        })}
      </Stack>

      <Button color="ghost" size="extraSmall" onClick={resetFilters} sx={{ flexShrink: 0 }}>
        {t`Reset filters`}
      </Button>
    </Stack>
  )
}
