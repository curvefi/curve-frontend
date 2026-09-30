import { type NumericTextFieldProps } from '@ui/features/forms/controls/NumericTextField'
import { type FilterProps } from '@ui/features/tables/data-table.utils'
import { useRangeFilter } from '@ui/features/tables/hooks/useRangeFilter'
import { RangeFilter } from '@ui/features/tables/RangeFilter'

type TableRangeFilterProps<TColumnId extends string> = FilterProps<TColumnId> & {
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  displayDefaultMin?: number | null
  defaultMin?: number | null
  isLoading?: boolean
  min?: number
  max?: number
}

export const TableRangeFilter = <TColumnId extends string>({
  id,
  adornment,
  displayDefaultMin,
  defaultMin,
  isLoading = false,
  min,
  max,
  ...filterProps
}: TableRangeFilterProps<TColumnId>) => {
  const [range, setRange] = useRangeFilter({ displayDefaultMin, defaultMin, isLoading, id, min, max, ...filterProps })

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
