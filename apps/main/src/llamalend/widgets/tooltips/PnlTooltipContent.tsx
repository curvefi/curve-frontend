import type { PositionPnlAndRoi } from '@/llamalend/position-pnl.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'

/** PNL and ROI of the position in one token, with that token's symbol */
type TokenPnl = { pnl: PositionPnlAndRoi['debt']; symbol: string | undefined }

const TokenPnlItem = ({ pnl: { pnl, roi }, symbol }: TokenPnl) => (
  <TooltipItem title={symbol ?? UNAVAILABLE_TOKEN_SYMBOL}>
    {notFalsy(formatNumber(pnl, 'token.delta'), roi && `(${formatNumber(roi, 'percent.delta')})`).join(' ')}
  </TooltipItem>
)

/** What PNL and ROI mean, with the position's PNL in the debt token, then in the collateral token, when known */
export const PnlTooltipContent = ({ debt, collateral }: { debt?: TokenPnl; collateral?: TokenPnl }) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`PNL (profit and loss): how much your position has gained or lost since you opened it, counting your deposits, withdrawals, borrows and repays.`}
    />
    <TooltipDescription
      text={t`ROI (return on investment): PNL as a percentage of what you invested, including what you borrowed to your wallet.`}
    />
    <TooltipDescription text={t`PNL is not available on markets without the V2 leverage zap.`} />
    {maybe(debt, debt => (
      <TooltipItems secondary>
        <TokenPnlItem {...debt} />
        {collateral && <TokenPnlItem {...collateral} />}
      </TooltipItems>
    ))}
    <TooltipFooter>{t`Excludes price impact you would pay to close.`}</TooltipFooter>
  </TooltipWrapper>
)
