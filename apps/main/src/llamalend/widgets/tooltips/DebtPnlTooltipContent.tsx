import { formatSigned, type PositionPnlAndRoe } from '@/llamalend/position-pnl.utils'
import { notFalsy } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

const formatDebtPnl = ({ pnl, roe }: PositionPnlAndRoe['debt'], symbol: string) =>
  t`In ${symbol}: ${notFalsy(
    `${formatSigned(pnl, 'token.amount')} ${symbol}`,
    roe && `(${formatSigned(roe, 'percent.value')})`,
  ).join(' ')}`

export const DebtPnlTooltipContent = ({ pnl, symbol }: { pnl: PositionPnlAndRoe['debt']; symbol: string }) => (
  <TooltipWrapper>
    <TooltipDescription text={formatDebtPnl(pnl, symbol)} />
  </TooltipWrapper>
)
