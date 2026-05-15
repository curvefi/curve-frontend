import { noop } from 'lodash'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import type { TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, parseRangeFilter, RANGE_SEPARATOR } from '@ui-kit/shared/ui/DataTable/filters'
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

const ActiveFilterChip = ({ label }: { label: string }) => (
  <SelectableChip selected toggle={noop} size="small" label={label} aria-label={label} />
)

export const LlamaTableFiltersCollapsible = <T extends TableItem>({
  table,
  resetFilters,
}: {
  table: TanstackTable<T>
  resetFilters: () => void
}) => {
  const columnFiltersState = table.getState().columnFilters as { id: LlamaMarketColumnId; value: string }[]
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
            !!visibleLabels.length && (
              <SelectedFilterChips key={id} title={column?.columnDef.header as string}>
                {visibleLabels.map(label => (
                  <ActiveFilterChip key={`${id}-${label}`} label={label} />
                ))}
                <HiddenInlinedItems
                  hiddenSelectedItemsLength={hiddenLabels.length}
                  renderItem={label => <ActiveFilterChip label={label} />}
                />
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
