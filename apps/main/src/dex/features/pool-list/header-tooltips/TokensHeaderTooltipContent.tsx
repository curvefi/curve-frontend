import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const TokensHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The tokens available for trading in this pool.`} />
  </TooltipWrapper>
)
