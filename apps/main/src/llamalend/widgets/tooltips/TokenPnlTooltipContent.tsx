import { formatSigned, type PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { notFalsy } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

/** PNL and ROI of the position in one token, with that token's symbol */
type TokenPnl = { pnl: PositionPnlAndRoi['debt']; symbol: string }

const formatTokenPnl = ({ pnl: { pnl, roi }, symbol }: TokenPnl) =>
  t`In ${symbol}: ${notFalsy(
    `${formatSigned(pnl, 'token.amount')} ${symbol}`,
    roi && `(${formatSigned(roi, 'percent.value')})`,
  ).join(' ')}`

/** The PNL and ROI in the debt token, then in the collateral token */
export const TokenPnlTooltipContent = ({ debt, collateral }: { debt: TokenPnl; collateral?: TokenPnl }) => (
  <TooltipWrapper>
    <TooltipDescription text={formatTokenPnl(debt)} />
    {collateral && <TooltipDescription text={formatTokenPnl(collateral)} />}
  </TooltipWrapper>
)
