import { formatSigned, type PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { notFalsy } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

const formatDebtPnl = ({ pnl, roi }: PositionPnlAndRoi['debt'], symbol: string) =>
  t`In ${symbol}: ${notFalsy(
    `${formatSigned(pnl, 'token.amount')} ${symbol}`,
    roi && `(${formatSigned(roi, 'percent.value')})`,
  ).join(' ')}`

export const DebtPnlTooltipContent = ({ pnl, symbol }: { pnl: PositionPnlAndRoi['debt']; symbol: string }) => (
  <TooltipWrapper>
    <TooltipDescription text={formatDebtPnl(pnl, symbol)} />
  </TooltipWrapper>
)
