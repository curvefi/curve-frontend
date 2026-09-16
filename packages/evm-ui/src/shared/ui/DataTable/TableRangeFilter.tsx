import { useRangeFilter } from '@evm-ui/shared/ui/DataTable/hooks/useRangeFilter'
import { RangeFilter } from '@evm-ui/shared/ui/DataTable/RangeFilter'
import { type NumericTextFieldProps } from '@ui/features/forms/controls/NumericTextField'
import { type FilterProps } from '@ui/features/tables/data-table.utils'

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
