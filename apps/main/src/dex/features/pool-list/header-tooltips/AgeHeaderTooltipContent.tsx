import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const AgeHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The time elapsed since this pool was created.`} />
    <TooltipDescription text={t`A dash is shown when the creation date is unavailable.`} />
  </TooltipWrapper>
)
