import { formatSigned, type PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { notFalsy } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

/** PNL and ROI of the position in one token, with that token's symbol */
type TokenPnl = { pnl: PositionPnlAndRoi['debt']; symbol: string }

const formatTokenPnl = ({ pnl: { pnl, roi }, symbol }: TokenPnl) =>
  notFalsy(`${formatSigned(pnl, 'token.amount')} ${symbol}`, roi && `(${formatSigned(roi, 'percent.value')})`).join(' ')

/** The PNL in the debt token, and in the collateral token: the result compared with just holding the collateral */
export const TokenPnlTooltipContent = ({ debt, collateral }: { debt?: TokenPnl; collateral?: TokenPnl }) => (
  <TooltipWrapper>
    {debt && <TooltipDescription text={t`In ${debt.symbol}: ${formatTokenPnl(debt)}`} />}
    {collateral && <TooltipDescription text={t`Vs holding ${collateral.symbol}: ${formatTokenPnl(collateral)}`} />}
  </TooltipWrapper>
)
