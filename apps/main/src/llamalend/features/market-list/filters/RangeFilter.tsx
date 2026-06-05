import { sortBy } from 'lodash'
import { useCallback } from 'react'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { NumericTextField, type NumericTextFieldProps } from '@ui-kit/shared/ui/NumericTextField'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Range } from '@ui-kit/types/util'
import { amount, decimal, formatNumber } from '@ui-kit/utils'
import { useRangeFilter } from './RangeSliderFilter/useRangeFilter'

const { Spacing } = SizesAndSpaces

type RangeFilterProps<TColumnId extends string> = FilterProps<TColumnId> & {
  id: TColumnId
  adornment?: NumericTextFieldProps['adornment']
  isLoading?: boolean
  min?: number
  max?: number
}

type InputIndex = 0 | 1

export const RangeFilter = <TColumnId extends string>({
  id,
  adornment,
  isLoading = false,
  min,
  max,
  ...filterProps
}: RangeFilterProps<TColumnId>) => {
  const [range, setRange] = useRangeFilter({ isLoading, id, min, max, ...filterProps })

  const handleInputChange = useCallback(
    (index: InputIndex) => (newValue: string | undefined) => {
      const nextFirst = index === 0 ? (amount(newValue) as number) : range[0]
      const nextSecond = index === 1 ? (amount(newValue) as number) : range[1]

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
      variant="outlined"
      fullWidth
      value={decimal(range[index])}
      min={decimal(min)}
      max={decimal(max)}
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
    <Stack direction="row" sx={{ gap: Spacing.sm }}>
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
