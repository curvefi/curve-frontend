import { get } from 'lodash'
import { useCallback, useMemo } from 'react'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import type { SliderProps } from '@mui/material/Slider/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { cleanColumnId } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'

/**
 * Get the maximum value from a field in an array of objects.
 * TODO: validate T[K] is number with typescript. DeepKeys makes it hard to do this.
 */
const getMaxValueFromData = <T extends any, K extends DeepKeys<T>>(data: T[], field: K) =>
  data.reduce((acc, item) => Math.max(acc, get(item, field) as number), 0)

type Range = [number, number]

type OnSliderChange = NonNullable<SliderProps['onChange']>

/**
 * A filter for tanstack tables that allows filtering by a range using a slider.
 */
export const RangeSliderFilter = <T extends unknown>({
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
  const max = useMemo(() => Math.ceil(+getMaxValueFromData(data, field).toPrecision(3) * 10) / 10, [data, field])
  const step = useMemo(() => Math.ceil(+max.toPrecision(2) / 100), [max])
  const defaultValue = useMemo(() => (columnFilters[id] ?? [0, max]) as Range, [columnFilters, id, max])

  const [range, setRange] = useUniqueDebounce(
    defaultValue,
    useCallback((newRange: Range) => setColumnFilter(id, newRange as Range), [id, setColumnFilter]),
  )

  const onChange = useCallback<OnSliderChange>((_, newRange) => setRange(newRange as Range), [setRange])

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
            {range.map(format).join(' - ')}
          </Typography>
        </Typography>
      )}
      value="" // we actually don't use the value of the select, but it needs to be set to avoid a warning
      MenuProps={{ elevation: 3 }}
    >
      <Stack paddingBlock={3} paddingInline={4} direction="row" spacing={6} alignItems="center">
        <Typography>{format(0)}</Typography>
        <Slider
          data-testid={`slider-${id}`}
          aria-label={title}
          getAriaValueText={format}
          value={range}
          onChange={onChange}
          min={0}
          max={max}
          step={step}
        />
        <Typography>{format(max)}</Typography>
      </Stack>
    </Select>
  )
}
