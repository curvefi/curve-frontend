import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const TvlHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Total USD value of assets currently deposited in the pool.`} />
    <TooltipDescription text={t`TVL measures deposited liquidity; it is not trading volume or yield.`} />
  </TooltipWrapper>
)
