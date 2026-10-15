import { getUserPositionPnl } from '@/llamalend/features/market-list/user-position.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { signedAmount } from '@/llamalend/widgets/pnl.utils'
import { PnlInDebtToken } from '@/llamalend/widgets/PnlLine'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { t } from '@ui/lib/i18n'
import { PositionMetricCell } from './PositionMetricCell'

const color = (value: number) => (value > 0 ? 'success' : value < 0 ? 'error' : 'textSecondary')

/** PNL in the collateral token with its ROE % below. Hover shows the debt-token value. Sorts by ROE %. */
export const UserPnlCell = ({ row }: CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>) => {
  const { stats, history } = row.original.positionQueries
  const { borrowed, collateral } = row.original.assets
  const pnl = getUserPositionPnl(row.original)
  const amount = maybe(pnl?.pnlCollateral, Number)
  const percent = maybe(pnl?.percentCollateral, Number)
  return (
    <Tooltip
      title={pnl && t`PNL (ROE %)`}
      body={pnl && <PnlInDebtToken pnl={pnl} borrowSymbol={borrowed.symbol} />}
      placement="top"
    >
      <Stack>
        <PositionMetricCell
          error={stats.error ?? history.error}
          hasData={stats.data != null && history.data != null}
          value={maybe(amount, value => `${signedAmount(value)} ${collateral.symbol}`)}
          valueTestId="user-position-pnl-value"
          support={
            percent != null && (
              <Typography variant="bodySRegular" color={color(percent)} data-testid="user-position-roe-percent">
                {`${percent > 0 ? '+' : ''}${formatNumber(percent, { abbreviate: false, decimals: 2 })}%`}
              </Typography>
            )
          }
        />
      </Stack>
    </Tooltip>
  )
}
