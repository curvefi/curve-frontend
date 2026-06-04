import { useCallback, useMemo } from 'react'
import { type FilterProps, type TableItem, type TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { type DecimalRangeValue, SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { Range } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import { useFacetedMaxMinValue } from './RangeSliderFilter/useFacetedMaxMinValue'
import { useRangeFilter } from './RangeSliderFilter/useRangeFilter'

type RangeSliderRowFilterProps<TData extends TableItem, TColumnId extends string> = FilterProps<TColumnId> & {
  table: TanstackTable<TData>
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
}

export const RangeSliderRowFilter = <TData extends TableItem, TColumnId extends string>({
  table,
  id,
  adornment,
  ...filterProps
}: RangeSliderRowFilterProps<TData, TColumnId>) => {
  const { min, max, step } = useFacetedMaxMinValue({ table, columnId: id })
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
