import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'

export const BoostTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Your current boost multiplier from veCRV voting power.`} />
    <TooltipDescription
      text={t`Boosted users receive a higher share of CRV rewards, depending on their veCRV balance and supply size.`}
    />
  </TooltipWrapper>
)
