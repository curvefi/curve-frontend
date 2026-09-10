import { useCallback, useMemo } from 'react'
import { useRangeFilter } from '@evm-ui/shared/ui/DataTable/hooks/useRangeFilter'
import { formatNumber } from '@primitives/number.utils'
import { type NumericTextFieldProps } from '@ui/features/forms/controls/NumericTextField'
import { type DecimalRangeValue, SliderInput } from '@ui/features/forms/controls/SliderInput'
import { Range } from '@ui/features/queries/util'
import { type FilterProps } from '@ui/features/tables/data-table.utils'
import { decimal } from '@ui/lib/decimal'

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
      inputProps={{ format: value => formatNumber(Number(value), { abbreviate: true }), adornment }}
      name={id}
    />
  )
}
