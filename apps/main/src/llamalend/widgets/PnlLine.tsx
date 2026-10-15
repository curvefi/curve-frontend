import type { PositionPnl } from '@/llamalend/position-metrics/zap-debt-share.utils'
import Typography from '@mui/material/Typography'
import { t } from '@ui/lib/i18n'
import { pnlText } from './pnl.utils'

/** PNL (ROE %) in the debt token, for tooltips next to the collateral-token value. */
export const PnlInDebtToken = ({ pnl, borrowSymbol }: { pnl: PositionPnl; borrowSymbol: string }) => (
  <Typography variant="bodySRegular">
    {t`In ${borrowSymbol}:`} {pnlText(Number(pnl.pnl), borrowSymbol, pnl.percent)}
  </Typography>
)
