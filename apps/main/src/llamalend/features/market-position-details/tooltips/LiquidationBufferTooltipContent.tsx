import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export const LiquidationBufferTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Liquidation Buffer shows the remaining buffer before hard liquidation can occur.`} />
    <TooltipDescription text={t`When at 0, hard liquidation may occur.`} />
  </TooltipWrapper>
)
