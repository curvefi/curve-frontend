import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const SupplyIncentivesTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`Rewards you earn on top of the supply yield: CRV at your boost, token incentives and supply campaigns.`}
    />
  </TooltipWrapper>
)
