import { formatSigned, type PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { notFalsy } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

/** PNL and ROI of the position in one token, with that token's symbol */
export type TokenPnl = { pnl: PositionPnlAndRoi['debt']; symbol: string }

const formatTokenPnl = ({ pnl: { pnl, roi }, symbol }: TokenPnl) =>
  t`In ${symbol}: ${notFalsy(
    `${formatSigned(pnl, 'token.amount')} ${symbol}`,
    roi && `(${formatSigned(roi, 'percent.value')})`,
  ).join(' ')}`

/** One line per token: the PNL in that token and its ROI */
export const TokenPnlTooltipContent = ({ breakdown }: { breakdown: TokenPnl[] }) => (
  <TooltipWrapper>
    {breakdown.map(tokenPnl => (
      <TooltipDescription key={tokenPnl.symbol} text={formatTokenPnl(tokenPnl)} />
    ))}
  </TooltipWrapper>
)
