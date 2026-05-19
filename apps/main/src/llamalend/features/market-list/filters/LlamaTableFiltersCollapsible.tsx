import { useMemo } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { toArray } from '@primitives/array.utils'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import type { FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import {
  parseListFilter,
  parseRangeFilter,
  rangeFilterFn,
  serializeListFilter,
} from '@ui-kit/shared/ui/DataTable/filters'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns/columns.enum'
import { HiddenInlinedItems } from './HiddenInlinedItems'
import { SelectedFilterChips } from './SelectedFilterChips'
import { getInlinedItemsVisibility } from './utils'

const { Spacing } = SizesAndSpaces

const formatRangeValue = (value: number, unit?: 'percentage' | 'dollar') =>
  formatNumber(value, { abbreviate: true, ...(unit && { unit }) })

// capitalize all labels except columns containing tokens symbols
const formatLabel = (label: string, id: LlamaMarketColumnId) =>
  [LlamaMarketColumnId.CollateralSymbol, LlamaMarketColumnId.BorrowedSymbol].includes(id)
    ? label
    : `${label.charAt(0).toUpperCase()}${label.slice(1)}`

// Convert a serialized range filter (`min~max`) into a single chip label
const getRangeLabel = (serializedRange: string | undefined, unit?: 'percentage' | 'dollar') => {
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
  // Keep networks first and sort the remaining filters alphabetically to avoid making the filters jump to another position when filters are removed
  const sortedFiltersState = useMemo(
    () =>
      filtersState.sort((a, b) => {
        if (a.id === LlamaMarketColumnId.Chain) return -1
        if (b.id === LlamaMarketColumnId.Chain) return 1
        return a.id.localeCompare(b.id)
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
          const column = table.getColumn(id)
          const isRangeFilterFn = column?.getFilterFn() === rangeFilterFn
          const labels = isRangeFilterFn
            ? notFalsy(getRangeLabel(value, column?.columnDef.meta?.unit))
            : parseListFilter(value)
          const [visibleLabels, hiddenLabels] = getInlinedItemsVisibility(labels)

          const removeClickedValue = (clickedValue: string | string[]) => {
            const activeValues = parseListFilter(value)
            const remainingValues = activeValues?.filter(v => !toArray(clickedValue).includes(v))
            setColumnFilter(id, serializeListFilter(remainingValues))
          }

          return (
            !!labels?.length && (
              <SelectedFilterChips key={`selected-chip-${id}`} title={column?.columnDef.header as string}>
                {/* Special chip for the chains filter */}
                {id === LlamaMarketColumnId.Chain ? (
                  <ChainFilterChips chains={labels} selectedChains={labels} toggleChain={removeClickedValue} />
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
