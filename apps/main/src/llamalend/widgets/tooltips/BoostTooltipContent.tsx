import { TooltipWrapper, TooltipDescription } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const BoostTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Your current boost multiplier from veCRV voting power.`} />
    <TooltipDescription
      text={t`Boosted users receive a higher share of CRV rewards, depending on their veCRV balance and supply size.`}
    />
  </TooltipWrapper>
)
