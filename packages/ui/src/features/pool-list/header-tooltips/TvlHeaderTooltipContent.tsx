import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const TvlHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Total USD value of assets currently deposited in the pool.`} />
    <TooltipDescription text={t`TVL measures deposited liquidity; it is not trading volume or yield.`} />
  </TooltipWrapper>
)
