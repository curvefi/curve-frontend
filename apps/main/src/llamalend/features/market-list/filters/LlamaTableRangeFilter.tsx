import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { useRangeFilter } from '@ui-kit/shared/ui/DataTable/hooks/useRangeFilter'
import { RangeFilter } from '@ui-kit/shared/ui/DataTable/RangeFilter'
import { type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'

type LlamaTableRangeFilterProps<TColumnId extends string> = FilterProps<TColumnId> & {
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  isLoading?: boolean
  min?: number
  max?: number
}

export const LlamaTableRangeFilter = <TColumnId extends string>({
  id,
  adornment,
  isLoading = false,
  min,
  max,
  ...filterProps
}: LlamaTableRangeFilterProps<TColumnId>) => {
  const [range, setRange] = useRangeFilter({ isLoading, id, min, max, ...filterProps })

  return (
    <RangeFilter
      id={id}
      range={range}
      setRange={setRange}
      adornment={adornment}
      isLoading={isLoading}
      min={min}
      max={max}
    />
  )
}
