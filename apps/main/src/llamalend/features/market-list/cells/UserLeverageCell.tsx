import { getMaxPositionLeverage } from '@/llamalend/max-leverage.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces
const leverageFormat = { abbreviate: false, maximumSignificantDigits: 3, unit: 'multiplier' } as const

export const UserLeverageCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  if (stats.error && stats.data == null) return <ErrorCell error={stats.error} />
  const value = getValue()
  const maxLeverage = getMaxPositionLeverage(row.original)
  return (
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }}>
      <Typography variant="tableCellMBold" data-testid="user-position-leverage-value">
        {value == undefined
          ? stats.data
            ? t`Unavailable`
            : ''
          : formatNumber(value, leverageFormat)}
      </Typography>
      {maxLeverage != null && (
        <Typography variant="bodyXsRegular" color="textSecondary" data-testid="user-position-max-leverage">
          {t`Max`} {formatNumber(maxLeverage, leverageFormat)}
        </Typography>
      )}
    </Stack>
  )
}
