import { sortBy } from 'lodash'
import { useCallback } from 'react'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { type DeepKeys } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { NumericTextField, type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import { useMaxValue } from './RangeSliderFilter/useMaxValue'
import { useRangeFilter } from './RangeSliderFilter/useRangeFilter'

const { Spacing } = SizesAndSpaces

type RangeFilterProps<TKey, TColumnId extends string> = FilterProps<TColumnId> & {
  queryData: QueryProp<TKey[]>
  field: DeepKeys<TKey>
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  min?: number
  max?: number
}

type InputIndex = 0 | 1
const parseNullableNumber = (value: string | undefined | null) => (value == null ? null : Number(value))

export const RangeFilter = <TKey, TColumnId extends string>({
  queryData,
  field,
  id,
  adornment,
  max,
  min = 0,
  ...filterProps
}: RangeFilterProps<TKey, TColumnId>) => {
  const data = queryData.data ?? []
  const isLoading = queryData.isLoading
  const { maxValue } = useMaxValue<TKey>({ max, data, field })
  const [range, setRange] = useRangeFilter({ isLoading, id, maxValue, ...filterProps })

  const handleInputChange = useCallback(
    (index: InputIndex) => (newValue: string | undefined) => {
      const nextFirst = index === 0 ? parseNullableNumber(newValue) : range[0]
      const nextSecond = index === 1 ? parseNullableNumber(newValue) : range[1]

      const nextRange: Range<number | null> | null =
        nextFirst != null && nextSecond != null && nextFirst > nextSecond
          ? // Keep the left bound from moving past the right one while typing.
            index === 0
            ? [nextFirst, nextFirst]
            : null
          : [nextFirst, nextSecond]

      if (nextRange) setRange(nextRange)
    },
    [range, setRange],
  )

  const handleInputBlur = useCallback(
    (index: InputIndex) => (blurValue: Decimal | undefined) => {
      if (blurValue == null) return

      const nextRange = range.map((value, i) => (i === index ? blurValue : value)) as Range<number | null>
      setRange(nextRange[0] != null && nextRange[1] != null ? (sortBy(nextRange) as Range<number>) : nextRange)
    },
    [range, setRange],
  )

  const renderInputField = ({
    index,
    placeholder,
    testId,
  }: {
    index: InputIndex
    placeholder: string
    testId: string
  }) => (
    <NumericTextField
      size="small"
      fullWidth
      value={decimal(range[index])}
      min={decimal(min)}
      max={decimal(maxValue)}
      onChange={handleInputChange(index)}
      onBlur={handleInputBlur(index)}
      disabled={isLoading}
      adornment={adornment}
      format={value => (value == null ? '' : formatNumber(value, { abbreviate: true }))}
      placeholder={placeholder}
      data-testid={`range-filter-${id}-${testId}`}
      sx={{ flex: 1 }}
    />
  )

  return (
    <Stack direction="row" gap={Spacing.sm}>
      {renderInputField({
        index: 0,
        placeholder: t`Min`,
        testId: 'min',
      })}
      {renderInputField({
        index: 1,
        placeholder: t`Max`,
        testId: 'max',
      })}
    </Stack>
  )
}
