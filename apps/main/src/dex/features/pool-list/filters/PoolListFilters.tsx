import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TableFilterButtonGroup } from '@ui-kit/shared/ui/DataTable/TableFilterButtonGroup'
import { TableFilterItem } from '@ui-kit/shared/ui/DataTable/TableFilterItem'
import { TableRangeFilter } from '@ui-kit/shared/ui/DataTable/TableRangeFilter'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { POOL_LIST_DEFAULT_TVL_MIN, PoolListFilterId, type PoolListFilterProps } from '../hooks/usePoolListFilters'

const { Spacing } = SizesAndSpaces

export const PoolListFilters = ({ columnFiltersById, poolTypeFilters, setColumnFilter }: PoolListFilterProps) => {
  const filterProps = { columnFiltersById, setColumnFilter }

  return (
    <Stack spacing={Spacing.sm} sx={{ padding: Spacing.sm }}>
      <TableFilterItem title={t`TVL`}>
        <TableRangeFilter
          id={PoolListFilterId.Tvl}
          adornment="dollar"
          defaultMin={POOL_LIST_DEFAULT_TVL_MIN}
          min={0}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={t`Volume`}>
        <TableRangeFilter
          id={PoolListFilterId.Volume}
          adornment="dollar"
          defaultMin={0}
          displayDefaultMin={null}
          min={0}
          {...filterProps}
        />
      </TableFilterItem>
      <TableFilterItem title={t`Base vAPY`}>
        <TableRangeFilter id={PoolListFilterId.Apy} adornment="percentage" defaultMin={null} {...filterProps} />
      </TableFilterItem>
      <TableFilterButtonGroup
        title={t`Pool type`}
        value={columnFiltersById[PoolListFilterId.PoolType] ?? ''}
        onChange={(_, value) => setColumnFilter(PoolListFilterId.PoolType, value || null)}
        ariaLabel={t`Pool type filter`}
        options={[{ value: '', label: t`All` }, ...poolTypeFilters.map(({ key, label }) => ({ value: key, label }))]}
        testIdSuffix="pool-filter-type"
      />
    </Stack>
  )
}
