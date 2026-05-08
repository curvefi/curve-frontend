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
    (index: 0 | 1) => (newValue: string | undefined) => {
      const nextFirst = index === 0 ? Number(newValue) : range[0]
      let nextSecond = index === 1 ? Number(newValue) : range[1]

      if (nextFirst > nextSecond) {
        // Keep the left bound from moving past the right one while typing.
        if (index === 0) nextSecond = nextFirst
        else return
      }

      setRange([nextFirst, nextSecond])
    },
    [range, setRange],
  )

  const handleInputBlur = useCallback(
    (index: 0 | 1) => (blurValue: Decimal | undefined) => {
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

  return (
    <Stack direction="row" gap={Spacing.sm} width="100%">
      <NumericTextField
        size="small"
        variant="standard"
        fullWidth
        value={decimal(range[0])}
        min={decimal(min)}
        max={decimal(maxValue)}
        onChange={handleInputChange(0)}
        onBlur={handleInputBlur(0)}
        adornment={adornment}
        format={value => formatNumber(Number(value), { abbreviate: true })}
        placeholder={t`Min`}
        data-testid={`range-filter-${id}-min`}
        sx={{ flex: 1 }}
      />
      <NumericTextField
        size="small"
        variant="standard"
        fullWidth
        value={decimal(range[1])}
        min={decimal(min)}
        max={decimal(maxValue)}
        onChange={handleInputChange(1)}
        onBlur={handleInputBlur(1)}
        adornment={adornment}
        format={value => formatNumber(Number(value), { abbreviate: true })}
        placeholder={t`Max`}
        data-testid={`range-filter-${id}-max`}
        sx={{ flex: 1 }}
      />
    </Stack>
  )
}
