import type { PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

/** PNL and ROI of the position in one token, with that token's symbol */
type TokenPnl = { pnl: PositionPnlAndRoi['debt']; symbol: string }

const formatTokenPnl = ({ pnl: { pnl, roi }, symbol }: TokenPnl) =>
  `${t`In ${symbol}`}: ${notFalsy(formatToken(pnl, symbol, 'delta'), roi && `(${formatNumber(roi, 'percent.delta')})`).join(' ')}`

/** The PNL and ROI in the debt token, then in the collateral token */
export const TokenPnlTooltipContent = ({ debt, collateral }: { debt: TokenPnl; collateral?: TokenPnl }) => (
  <TooltipWrapper>
    <TooltipDescription text={formatTokenPnl(debt)} />
    {collateral && <TooltipDescription text={formatTokenPnl(collateral)} />}
  </TooltipWrapper>
)
