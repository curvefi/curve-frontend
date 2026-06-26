import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

export const LiquidationBufferTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Liquidation Buffer shows the remaining buffer before hard liquidation can occur.`} />
    <TooltipDescription text={t`When at 0, hard liquidation can occur.`} />
  </TooltipWrapper>
)
