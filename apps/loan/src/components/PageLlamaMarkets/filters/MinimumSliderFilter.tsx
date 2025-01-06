import { useMemo } from 'react'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { get } from 'lodash'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { cleanColumnId } from '@ui-kit/shared/ui/TableColumnVisibilityPopover'

/**
 * Get the maximum value from a field in an array of objects.
 * TODO: validate T[K] is number with typescript. DeepKeys makes it hard to do this.
 */
const getMaxValueFromData = <T extends any, K extends DeepKeys<T>>(data: T[], field: K) =>
  data.reduce((acc, item) => Math.max(acc, get(item, field) as number), 0)

/**
 * A filter for tanstack tables that allows filtering by a minimum value using a slider.
 */
export const MinimumSliderFilter = <T extends unknown>({
  columnFilters,
  setColumnFilter,
  data,
  title,
  format,
  field,
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: T[]
  title: string
  field: DeepKeys<T>
  format: (value: number) => string
}) => {
  const id = cleanColumnId(field)
  const max = useMemo(() => getMaxValueFromData(data, field), [data, field])
  const [value] = (columnFilters[id] ?? [0, max]) as [number, number] // tanstack expects a [min, max] tuple
  return (
    // this is not a real select, but we reuse the component so the design is correct
    <Select
      fullWidth
      size="small"
      displayEmpty
      data-testid={`minimum-slider-filter-${id}`}
      renderValue={() => (
        <Typography variant="bodyMRegular">
          {`${title}: `}
          <Typography component="span" variant="bodyMBold">
            {format(value)}
          </Typography>
        </Typography>
      )}
      value="" // we actually don't use the value of the select, but it needs to be set to avoid a warning
    >
      <Stack paddingBlock={3} paddingInline={4} direction="row" spacing={6}>
        <Typography>{format(0)}</Typography>
        <Slider
          data-testid={`slider-${id}`}
          aria-label={title}
          getAriaValueText={format}
          value={value}
          onChange={(_, min) => setColumnFilter(id, [min, max])}
          min={0}
          max={max}
          step={+max.toPrecision(2) / 100}
        />
        <Typography>{format(max)}</Typography>
      </Stack>
    </Select>
  )
}
