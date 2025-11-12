import lodash, { clamp } from 'lodash'
import { useCallback, useMemo } from 'react'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type DeepKeys } from '@tanstack/table-core'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { type DecimalRangeValue, SliderInput, SliderInputProps } from '@ui-kit/shared/ui/SliderInput'
import { type Decimal, decimal, formatNumber } from '@ui-kit/utils'
import { invertPowerMap, powerMap } from '@ui-kit/utils/interpolations'
import type { LlamaMarketColumnId } from '../columns.enum'

type NumberRange = [number, number]

type OnSliderChange<T extends Decimal | [Decimal, Decimal]> = NonNullable<SliderInputProps<T>['onChange']>

/**
 * Props for the RangeSliderFilter component.
 */
type RangeSliderFilterProps<T> = {
  /** The current state of all column filters. */
  columnFilters: Record<string, unknown>
  /** Callback to update a specific column filter by ID. */
  setColumnFilter: (id: string, value: unknown) => void
  /** The array of data items to calculate min/max values from. */
  data: T[]
  /** The display title for this filter (shown on mobile). */
  title: string
  /** The nested field path in the data object to filter on. */
  field: DeepKeys<T>
  /** The unique identifier for this filter column. */
  id: LlamaMarketColumnId
  /** Function to format numbers for committed filter values. */
  format: (value: number) => string
  /** Optional adornment for the numeric text fields. */
  adornment?: NumericTextFieldProps['adornment']
  /** Optional scale transformation mode ('power' for non-linear scaling). */
  scale?: 'power'
  /** The minimum value for the slider range (defaults to 0). */
  min?: number
  /** Optional override for the maximum value (calculated from data if not provided). */
  max?: number
  /** The default minimum value for the range (defaults to min). */
  defaultMin?: number
}

/**
 * Get the maximum value from a field in an array of objects.
 * TODO: validate T[K] is number with typescript. DeepKeys makes it hard to do this.
 */
const getMaxValueFromData = <T, K extends DeepKeys<T>>(data: T[], field: K) =>
  data.reduce((acc, item) => Math.max(acc, lodash.get(item, field) as number), 0)

/**
 * Calculate a power exponent that feels "good" based on the max value.
 */
const calculatePowerExponent = (isPowerScale: boolean, minValue: number, maxValue: number): number | undefined => {
  if (!isPowerScale || maxValue <= minValue) return undefined
  const safeMax = Math.max(maxValue, 1)
  const exponent = Math.trunc(Math.log10(safeMax) - 2)
  return Math.max(exponent, 1)
}

/**
 * Helpers that convert real values to and from the slider's value space.
 */
const calculateSliderValueTransform = (minValue: number, maxValue: number, isPowerScale: boolean) => {
  const powerExponent = calculatePowerExponent(isPowerScale, minValue, maxValue)
  if (powerExponent == null) {
    return
  }

  const [sliderMin, sliderMax] = [0, 1]
  return {
    /** Convert the current value into the 0-1 slider space. */
    toSlider: (value: number) => invertPowerMap(clamp(value, minValue, maxValue), minValue, maxValue, powerExponent),
    /** Bring the normalized slider value back into the actual units. */
    fromSlider: (value: number) => powerMap(clamp(value, sliderMin, sliderMax), minValue, maxValue, powerExponent),
    sliderMin,
    sliderMax,
    sliderStep: 0.001,
  }
}

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
  adornment,
  scale,
  max,
  min = 0,
  defaultMin = min,
}: RangeSliderFilterProps<T>) => {
  const isMobile = useIsMobile()
  const maxValue = useMemo(() => max ?? Math.ceil(getMaxValueFromData(data, field)), [max, data, field]) // todo: round this to a nice number
  const step = useMemo(() => Math.ceil(+maxValue.toPrecision(2) / 100), [maxValue])
  const isPowerScale = scale === 'power'

  const sliderValueTransform = useMemo(
    () => calculateSliderValueTransform(min, maxValue, isPowerScale),
    [min, maxValue, isPowerScale],
  )

  const defaultRange = useMemo<NumberRange>(() => [defaultMin, maxValue], [defaultMin, maxValue])
  // Currently applied filter rangedefaultMin
  const appliedRange = useMemo((): NumberRange => {
    const [minFilter, maxFilter] = (columnFilters[id] as NumberRange) ?? []
    return [minFilter ?? defaultMin, maxFilter ?? maxValue]
  }, [columnFilters, id, maxValue, defaultMin])

  const [range, setRange] = useUniqueDebounce({
    // Separate default and applied range, because the input's onBlur event that didn’t actually change anything could trigger the callback, and would clear the filter.
    defaultValue: appliedRange,
    callback: useCallback(
      (newRange: NumberRange) =>
        setColumnFilter(
          id,
          newRange.every((value, i) => value === defaultRange[i])
            ? undefined // remove the filter if the range is the same as the default range
            : [newRange[0] === defaultMin ? null : newRange[0], newRange[1] === maxValue ? null : newRange[1]],
        ),
      [defaultMin, defaultRange, id, maxValue, setColumnFilter],
    ),
  })

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
      MenuProps={{
        elevation: 3,
        MenuListProps: {
          disableListWrap: true,
          // needed to prevent the menu from collapsing after a value is selected
          variant: 'menu',
        },
      }}
    >
      <Stack paddingBlock={3} paddingInline={4}>
        <SliderInput<DecimalRangeValue>
          layoutDirection="column"
          size="medium"
          value={useMemo(() => range.map(decimal) as DecimalRangeValue, [range])}
          onChange={useCallback<OnSliderChange<DecimalRangeValue>>(
            (newRange) => setRange(newRange.map(Number) as NumberRange),
            [setRange],
          )}
          min={min}
          max={maxValue}
          step={sliderValueTransform?.sliderStep ?? step}
          sliderValueTransform={sliderValueTransform}
          inputProps={{
            format: (value) => formatNumber(Number(value), { abbreviate: true }),
            adornment,
          }}
          testId={id}
        />
      </Stack>
    </Select>
  )
}
