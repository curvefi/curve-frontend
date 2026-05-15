import { useCallback } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { toArray } from '@primitives/array.utils'
import { t } from '@ui-kit/lib/i18n'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import type { FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import {
  parseListFilter,
  parseRangeFilter,
  RANGE_SEPARATOR,
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

// Convert a serialized range filter (`min~max`) into a single chip label
const getRangeLabel = (serializedRange: string | undefined, unit?: 'percentage' | 'dollar') => {
  const [min, max] = parseRangeFilter(serializedRange) ?? []

  if ((min == null || min === 0) && max != null) return `<${formatRangeValue(max, unit)}`
  if (min != null && max == null) return `>${formatRangeValue(min, unit)}`
  if (min != null && max != null) return `${formatRangeValue(min, unit)} - ${formatRangeValue(max, unit)}`

  return null
}

// Normalize serialized filter values into chip labels
const getFilterLabels = (serializedFilter: string | undefined, unit?: 'percentage' | 'dollar') => {
  if (serializedFilter?.includes(RANGE_SEPARATOR)) {
    const label = getRangeLabel(serializedFilter, unit)
    return label ? Array(label) : []
  }
  return parseListFilter(serializedFilter)
}

const removeFilterValue = (
  id: LlamaMarketColumnId,
  value: string,
  clickedValues: string | string[],
  setColumnFilter: FilterProps<LlamaMarketColumnId>['setColumnFilter'],
) => {
  if (value.includes(RANGE_SEPARATOR)) {
    setColumnFilter(id, null)
    return
  }

  const selectedValues = parseListFilter(value)
  if (!selectedValues?.length || selectedValues.length === 1) {
    setColumnFilter(id, null)
    return
  }

  const remainingValues = selectedValues.filter(selectedValue => !toArray(clickedValues).includes(selectedValue))
  setColumnFilter(id, serializeListFilter(remainingValues))
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
  const columnFiltersState = table.getState().columnFilters as { id: LlamaMarketColumnId; value: string }[]
  const toggleFilterValue = useCallback(
    (id: LlamaMarketColumnId, value: string, clickedValues: string | string[]) =>
      removeFilterValue(id, value, clickedValues, setColumnFilter),
    [setColumnFilter],
  )

  return (
    <Stack
      paddingBlock={Spacing.xs}
      paddingInline="10px"
      direction="row"
      alignItems="end"
      gap={Spacing.sm}
      justifyContent="space-between"
      sx={{ borderTop: t => `1px solid ${t.design.Layer[1].Outline}` }}
    >
      <Stack direction="row" gap={Spacing.sm} flexWrap="wrap">
        {columnFiltersState.map(({ id, value }) => {
          const column = table.getColumn(id)
          const labels = getFilterLabels(value, column?.columnDef.meta?.unit)
          const [visibleLabels, hiddenLabels] = getInlinedItemsVisibility(labels)

          return (
            !!labels?.length && (
              <SelectedFilterChips key={`selected-chip-${id}`} title={column?.columnDef.header as string}>
                {/* Special chip for the chains filter */}
                {id === LlamaMarketColumnId.Chain ? (
                  <ChainFilterChips
                    chains={labels}
                    selectedChains={labels}
                    toggleChain={clickedValue => toggleFilterValue(id, value, clickedValue)}
                  />
                ) : (
                  <>
                    {visibleLabels.map(label => (
                      <ActiveFilterChip
                        key={`${label}-${id}`}
                        label={label}
                        toggle={() => toggleFilterValue(id, value, label)}
                      />
                    ))}
                    <HiddenInlinedItems
                      hiddenSelectedItemsLength={hiddenLabels.length}
                      renderItem={label => (
                        <ActiveFilterChip label={label} toggle={() => toggleFilterValue(id, value, hiddenLabels)} />
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
