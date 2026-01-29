import { useCallback, useMemo } from 'react'
import { useMaxValue } from '@/llamalend/features/market-list/filters/RangeSliderFilter/useMaxValue'
import { useRangeFilter } from '@/llamalend/features/market-list/filters/RangeSliderFilter/useRangeFilter'
import { useSliderValueTransform } from '@/llamalend/features/market-list/filters/RangeSliderFilter/useSliderValueTransform'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type DeepKeys } from '@tanstack/table-core'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { type DecimalRangeValue, SliderInput, SliderInputProps } from '@ui-kit/shared/ui/SliderInput'
import { NumberRange } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'

type OnSliderChange = NonNullable<SliderInputProps<DecimalRangeValue>['onChange']>

/**
 * Props for the RangeSliderFilter component.
 */
type RangeSliderFilterProps<TKey, TColumnId extends string> = FilterProps<TColumnId> & {
  /** The array of data items to calculate min/max values from. */
  data: TKey[]
  /** The display title for this filter (shown on mobile). */
  title: string
  /** The nested field path in the data object to filter on. */
  field: DeepKeys<TKey>
  /** The unique identifier for this filter column. */
  id: TColumnId
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
}

/**
 * A filter for tanstack tables that allows filtering by a range using a slider.
 */
export const RangeSliderFilter = <TKey, TColumnId extends string>({
  data,
  title,
  format,
  field,
  id,
  adornment,
  scale,
  max,
  min = 0,
  ...filterProps
}: RangeSliderFilterProps<TKey, TColumnId>) => {
  const isMobile = useIsMobile()
  const { maxValue, step } = useMaxValue<TKey>({ max, data, field })
  const sliderValueTransform = useSliderValueTransform({ min, max: maxValue, isPowerScale: scale === 'power' })
  const [range, setRange] = useRangeFilter({ id, maxValue, ...filterProps })
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
          onChange={useCallback<OnSliderChange>(
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
          id={id}
        />
      </Stack>
    </Select>
  )
}
