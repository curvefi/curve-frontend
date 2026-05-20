import { useCallback, useMemo } from 'react'
import { type DeepKeys } from '@tanstack/table-core'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { type DecimalRangeValue, SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { QueryProp, Range } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import { useMaxValue } from './RangeSliderFilter/useMaxValue'
import { useRangeFilter } from './RangeSliderFilter/useRangeFilter'

type RangeSliderRowFilterProps<TKey, TColumnId extends string> = FilterProps<TColumnId> & {
  query: QueryProp<TKey[]>
  field: DeepKeys<TKey>
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  min?: number
  max?: number
}

export const RangeSliderRowFilter = <TKey, TColumnId extends string>({
  query: { data = [] },
  field,
  id,
  adornment,
  max,
  min = 0,
  ...filterProps
}: RangeSliderRowFilterProps<TKey, TColumnId>) => {
  const { maxValue, step } = useMaxValue<TKey>({ max, data, field })
  const [range, setRange] = useRangeFilter({ id, maxValue, ...filterProps })

  return (
    <SliderInput<DecimalRangeValue>
      value={useMemo(() => range.map(decimal) as DecimalRangeValue, [range])}
      onChange={useCallback(newRange => setRange(newRange.map(Number) as Range<number>), [setRange])}
      min={min}
      max={maxValue}
      step={step}
      inputProps={{
        format: value => formatNumber(Number(value), { abbreviate: true }),
        adornment,
      }}
      name={id}
    />
  )
}
