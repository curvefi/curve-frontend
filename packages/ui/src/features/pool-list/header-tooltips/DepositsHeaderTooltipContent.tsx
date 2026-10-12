import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const DepositsHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`USD value of your staked and unstaked LP tokens, calculated using the LP token price.`}
    />
  </TooltipWrapper>
)
