import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const AgeHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The time elapsed since this pool was created.`} />
    <TooltipDescription text={t`A dash is shown when the creation date is unavailable.`} />
  </TooltipWrapper>
)
