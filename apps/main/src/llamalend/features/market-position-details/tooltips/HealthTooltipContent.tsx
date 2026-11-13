import type { PositionStatus } from '@/llamalend/health.utils'
import { TooltipDescription, TooltipFormula, TooltipFraction, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { POSITION_STATUS_DESCRIPTION } from '../health/position-status'

export const HealthTooltipContent = ({ status }: { status?: PositionStatus }) => (
  <TooltipWrapper testId={status && `health-tooltip-status-${status}`}>
    <TooltipDescription
      text={t`Health reaches 1.00 at the start of the Liquidation range, where collateral can convert and losses can occur. It stays at 1.00 within and below the range; monitor Liquidation buffer and Status.`}
    />
    <TooltipFormula
      formula={
        <>
          {t`Health = max(`}
          <TooltipFraction numerator={t`Oracle price`} denominator={t`Upper boundary`} />
          {', 1)'}
        </>
      }
    />
    {status && POSITION_STATUS_DESCRIPTION[status].map(text => <TooltipDescription key={text} text={text} />)}
  </TooltipWrapper>
)
