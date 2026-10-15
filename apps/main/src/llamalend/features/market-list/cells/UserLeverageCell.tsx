import { getUserPositionOpeningLeverage } from '@/llamalend/features/market-list/user-position.utils'
import { getMaxPositionLeverage } from '@/llamalend/max-leverage.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipDescription } from '@ui/components/TooltipComponents'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { PositionMetricCell } from './PositionMetricCell'

const leverageFormat = { abbreviate: false, maximumSignificantDigits: 3, unit: 'multiplier' } as const

/** Current leverage with the market max below, like the position card. Hover shows the opening leverage. */
export const UserLeverageCell = ({
  getValue,
  row,
}: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const stats = row.original.positionQueries.stats
  const value = getValue()
  const maxLeverage = getMaxPositionLeverage(row.original)
  const openingLeverage = getUserPositionOpeningLeverage(row.original)
  return (
    <Tooltip
      title={openingLeverage != null && t`Opened at`}
      body={
        openingLeverage != null && (
          <TooltipDescription
            text={t`The position opened at ${formatNumber(openingLeverage, leverageFormat)}. Leverage moves with price after that.`}
          />
        )
      }
      placement="top"
    >
      <Stack>
        <PositionMetricCell
          error={stats.error}
          hasData={stats.data != null}
          value={maybe(value, amount => formatNumber(amount, leverageFormat))}
          valueTestId="user-position-leverage-value"
          support={
            maxLeverage != null && (
              <Typography variant="bodySRegular" color="textSecondary" data-testid="user-position-max-leverage">
                {t`Max`} {formatNumber(maxLeverage, leverageFormat)}
              </Typography>
            )
          }
        />
      </Stack>
    </Tooltip>
  )
}
