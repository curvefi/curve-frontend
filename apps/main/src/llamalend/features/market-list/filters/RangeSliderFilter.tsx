import lodash from 'lodash'
import { useCallback, useMemo } from 'react'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import type { SliderProps } from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type DeepKeys } from '@tanstack/table-core'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import type { LlamaMarketColumnId } from '../columns.enum'

/**
 * Get the maximum value from a field in an array of objects.
 * TODO: validate T[K] is number with typescript. DeepKeys makes it hard to do this.
 */
const getMaxValueFromData = <T, K extends DeepKeys<T>>(data: T[], field: K) =>
  data.reduce((acc, item) => Math.max(acc, lodash.get(item, field) as number), 0)

type NumberRange = [number, number]

type OnSliderChange = NonNullable<SliderProps['onChange']>

/**
 * A filter for tanstack tables that allows filtering by a range using a slider.
 */
export const RangeSliderFilter = <T,>({
  columnFilters,
  setColumnFilter,
  data,
  title,
  format,
  field,
  id,
  defaultMinimum = 0,
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: T[]
  title: string
  field: DeepKeys<T>
  id: LlamaMarketColumnId
  format: (value: number) => string
  defaultMinimum?: number
}) => {
  const maxValue = useMemo(() => Math.ceil(getMaxValueFromData(data, field)), [data, field]) // todo: round this to a nice number
  const step = useMemo(() => Math.ceil(+maxValue.toPrecision(2) / 100), [maxValue])
  const defaultValue = useMemo((): NumberRange => {
    const [min, max] = (columnFilters[id] as NumberRange) ?? []
    return [min ?? defaultMinimum, max ?? maxValue]
  }, [columnFilters, id, maxValue, defaultMinimum])
  const isMobile = useIsMobile()

  const [range, setRange] = useUniqueDebounce({
    defaultValue,
    callback: useCallback(
      (newRange: NumberRange) =>
        setColumnFilter(
          id,
          newRange.every((value, i) => value === defaultValue[i])
            ? undefined // remove the filter if the range is the same as the default
            : [newRange[0] === defaultMinimum ? null : newRange[0], newRange[1] === maxValue ? null : newRange[1]],
        ),
      [defaultMinimum, defaultValue, id, maxValue, setColumnFilter],
    ),
  })

  const onChange = useCallback<OnSliderChange>((_, newRange) => setRange(newRange as NumberRange), [setRange])

  return (
    // this is not a real select, but we reuse the component so the design is correct
    <Select
      fullWidth
      size={isMobile ? 'medium' : 'small'}
      displayEmpty
      data-testid={`minimum-slider-filter-${id}`}
      renderValue={() => (
        <Typography variant="bodySRegular">
          {isMobile && `${title}: `}
          <Typography component="span" variant="bodySBold">
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
          max={maxValue}
          step={step}
        />
        <Typography>{format(maxValue)}</Typography>
      </Stack>
    </Select>
  )
}
