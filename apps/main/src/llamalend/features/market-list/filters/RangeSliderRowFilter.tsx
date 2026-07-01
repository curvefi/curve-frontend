import { useCallback, useMemo } from 'react'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { useRangeFilter } from '@ui-kit/shared/ui/DataTable/hooks/useRangeFilter'
import { type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { type DecimalRangeValue, SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { Range } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'

type RangeSliderRowFilterProps<TColumnId extends string> = FilterProps<TColumnId> & {
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  min?: number
  max?: number
  step?: number
}

export const RangeSliderRowFilter = <TColumnId extends string>({
  id,
  adornment,
  min,
  max,
  step,
  ...filterProps
}: RangeSliderRowFilterProps<TColumnId>) => {
  const [range, setRange] = useRangeFilter({ id, min, max, ...filterProps })

  return (
    <SliderInput<DecimalRangeValue>
      value={useMemo(() => range.map(decimal) as DecimalRangeValue, [range])}
      onChange={useCallback(newRange => setRange(newRange.map(Number) as Range<number>), [setRange])}
      min={min}
      max={max}
      step={step}
      inputProps={{
        format: value => formatNumber(Number(value), { abbreviate: true }),
        adornment,
      }}
      name={id}
    />
  )
}
