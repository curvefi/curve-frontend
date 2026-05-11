import { sortBy } from 'lodash'
import { useCallback } from 'react'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { type DeepKeys } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { NumericTextField, type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Range } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import { useMaxValue } from './RangeSliderFilter/useMaxValue'
import { useRangeFilter } from './RangeSliderFilter/useRangeFilter'

const { Spacing } = SizesAndSpaces

type RangeFilterProps<TKey, TColumnId extends string> = FilterProps<TColumnId> & {
  data: TKey[]
  field: DeepKeys<TKey>
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  min?: number
  max?: number
}

type InputIndex = 0 | 1

export const RangeFilter = <TKey, TColumnId extends string>({
  data,
  field,
  id,
  adornment,
  max,
  min = 0,
  ...filterProps
}: RangeFilterProps<TKey, TColumnId>) => {
  const { maxValue } = useMaxValue<TKey>({ max, data, field })
  const [range, setRange] = useRangeFilter({ id, maxValue, ...filterProps })

  const handleInputChange = useCallback(
    (index: InputIndex) => (newValue: string | undefined) => {
      const nextFirst = index === 0 ? Number(newValue) : range[0]
      const nextSecond = index === 1 ? Number(newValue) : range[1]

      const nextRange: Range<number> | null =
        nextFirst > nextSecond
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

      setRange(
        sortBy([
          Number(index === 0 ? blurValue : range[0]),
          Number(index === 1 ? blurValue : range[1]),
        ]) as Range<number>,
      )
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
