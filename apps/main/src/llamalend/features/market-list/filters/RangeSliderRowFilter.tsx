import { useCallback, useMemo } from 'react'
import { type FilterProps } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { useRangeFilter } from '@evm-ui/shared/ui/DataTable/hooks/useRangeFilter'
import { type NumericTextFieldProps } from '@evm-ui/shared/ui/NumericTextField'
import { type DecimalRangeValue, SliderInput } from '@evm-ui/shared/ui/SliderInput'
import { Range } from '@evm-ui/types/util'
import { decimal, formatNumber } from '@evm-ui/utils'

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
