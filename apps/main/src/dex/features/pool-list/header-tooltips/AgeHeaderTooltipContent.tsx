import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const AgeHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The time elapsed since this pool was created.`} />
    <TooltipDescription text={t`A dash is shown when the creation date is unavailable.`} />
  </TooltipWrapper>
)
