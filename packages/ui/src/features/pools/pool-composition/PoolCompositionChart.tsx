import { useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { toArray } from '@primitives/array.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Spinner } from '@ui/components/Spinner'
import { TokenIcons } from '@ui/components/TokenIcons'
import { PieChart } from '@ui/features/charts/PieChart'
import { combineQueryState } from '@ui/features/queries/combine'
import { type QueryProp, toQuery, toValue } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import type { PoolCompositionRow } from './columns/columns.definitions'

const formatShare = (value: number | undefined) => formatNumber(value, 'percent.rate')

export const PoolCompositionChart = ({ rows }: { rows: QueryProp<PoolCompositionRow[]> }) => {
  const composition = rows.data
  const chart = useMemo(
    () =>
      rows.data?.map(({ source, displayAddress, marketShare }) => ({
        id: displayAddress,
        name: toValue(source.primary),
        value: maybe(marketShare.data, Number),
      })),
    [rows.data],
  )
  const { isLoading, error } = composition
    ? combineQueryState(
        rows,
        ...composition.flatMap(({ source, marketShare }) => [toQuery(source.primary), marketShare]),
      )
    : rows

  if (isLoading || error || chart?.length === 0) {
    return (
      <Stack sx={{ height: '100%', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? (
          <Spinner />
        ) : (
          <Typography variant="bodySRegular" color="textSecondary">
            {error ? t`Unable to load reserves` : t`No reserves to display`}
          </Typography>
        )}
      </Stack>
    )
  }

  if (!composition || !chart) return null

  return (
    <PieChart data={chart} formatValue={formatShare} testId="pool-composition-chart">
      <TokenIcons
        blockchainId={composition[0].source.blockchainId}
        tokens={composition.flatMap(({ source }) => toArray(source.address).map(address => ({ address })))}
        size="lg"
        showTooltips={false}
      />
    </PieChart>
  )
}
