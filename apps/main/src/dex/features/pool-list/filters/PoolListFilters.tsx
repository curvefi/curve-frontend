import type { MouseEvent } from 'react'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { RangeFilter } from '@ui-kit/shared/ui/DataTable/RangeFilter'
import {
  TableFilterButtonGroup,
  type TableFilterButtonOption,
} from '@ui-kit/shared/ui/DataTable/TableFilterButtonGroup'
import { TableFilterItem } from '@ui-kit/shared/ui/DataTable/TableFilterItem'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolListFilterProps, PoolListNumberRange } from '../hooks/usePoolListFilters'
import type { PoolListPoolType } from '../poolList.constants'
import { PoolListDateRangeFilter } from './PoolListDateRangeFilter'

const { Spacing } = SizesAndSpaces

const ALL_FILTER_VALUE = 'all' as const

type PoolTypeFilterValue = PoolListPoolType | typeof ALL_FILTER_VALUE
type NumberRangeFilter = {
  adornment: 'dollar' | 'percentage'
  id: string
  min?: number
  title: string
  range: PoolListNumberRange
  setRange: (range: PoolListNumberRange) => void
}

export const PoolListFilters = ({
  apyRange,
  creationDateRange,
  poolType,
  poolTypeFilters,
  setApyRange,
  setCreationDateRange,
  setPoolType,
  setTvlRange,
  setVolumeRange,
  tvlRange,
  volumeRange,
}: PoolListFilterProps) => {
  const onPoolTypeChange = (_: MouseEvent<HTMLElement>, value: PoolTypeFilterValue | null) =>
    setPoolType(value && value !== ALL_FILTER_VALUE ? value : null)
  const poolTypeOptions: readonly TableFilterButtonOption<PoolTypeFilterValue>[] = [
    { value: ALL_FILTER_VALUE, label: t`All` },
    ...poolTypeFilters.map(({ key, label }) => ({ value: key, label })),
  ]
  const numberRangeFilters: readonly NumberRangeFilter[] = [
    {
      id: 'tvl',
      title: t`TVL`,
      range: tvlRange,
      setRange: setTvlRange,
      adornment: 'dollar',
      min: 0,
    },
    {
      id: 'volume',
      title: t`Volume`,
      range: volumeRange,
      setRange: setVolumeRange,
      adornment: 'dollar',
      min: 0,
    },
    {
      id: 'apy',
      title: t`Base vAPY`,
      range: apyRange,
      setRange: setApyRange,
      adornment: 'percentage',
    },
  ]

  return (
    <Stack spacing={Spacing.sm} sx={{ padding: Spacing.sm }}>
      {numberRangeFilters.map(({ title, ...filter }) => (
        <TableFilterItem key={filter.id} title={title}>
          <RangeFilter {...filter} />
        </TableFilterItem>
      ))}
      <TableFilterItem title={t`Creation date`}>
        <PoolListDateRangeFilter range={creationDateRange} setRange={setCreationDateRange} />
      </TableFilterItem>
      <TableFilterButtonGroup
        title={t`Pool type`}
        value={poolType ?? ALL_FILTER_VALUE}
        onChange={onPoolTypeChange}
        ariaLabel={t`Pool type filter`}
        options={poolTypeOptions}
        testIdSuffix="pool-filter-type"
      />
    </Stack>
  )
}
