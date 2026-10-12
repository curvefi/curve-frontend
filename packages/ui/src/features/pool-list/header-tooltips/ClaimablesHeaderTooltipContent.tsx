import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const ClaimablesHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Unclaimed CRV and other reward tokens earned by this position, valued in USD.`} />
  </TooltipWrapper>
)
