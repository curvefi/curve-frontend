import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const PoolHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The pool name and the tokens it contains.`} />
    <TooltipDescription text={t`Pool or token warnings and your balance indicator are shown when applicable.`} />
  </TooltipWrapper>
)
