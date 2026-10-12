import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const TokensHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The tokens available for trading in this pool.`} />
  </TooltipWrapper>
)
