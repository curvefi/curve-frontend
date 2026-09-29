import { BigNumber } from 'bignumber.js'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { getUserPositionComposition } from '../user-position.utils'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const UserCollateralCompositionCell = ({
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  if (stats.error && stats.data == null) return <ErrorCell error={stats.error} />
  const composition = getUserPositionComposition(row.original)
  const { collateral, borrowed } = row.original.assets
  return (
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }} data-testid="user-position-composition">
      <Typography variant="tableCellMBold">
        {composition
          ? `${BigNumber(composition.collateralLabel).toFixed(2)}% ${collateral.symbol}`
          : stats.data
            ? t`Unavailable`
            : ''}
      </Typography>
      {composition && (
        <Typography variant="bodyXsRegular" color="textSecondary">
          {`${BigNumber(composition.borrowedLabel).toFixed(2)}% ${borrowed.symbol}`}
        </Typography>
      )}
    </Stack>
  )
}
