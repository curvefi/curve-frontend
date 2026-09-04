import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const LiquidationBufferTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Liquidation Buffer shows the remaining buffer before hard liquidation can occur.`} />
    <TooltipDescription text={t`When zero, hard liquidation may occur.`} />
  </TooltipWrapper>
)
