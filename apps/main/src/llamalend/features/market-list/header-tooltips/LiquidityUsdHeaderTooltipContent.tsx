import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

export const LiquidityUsdHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Total unborrowed supply in the market.`} />
    <TooltipDescription
      text={t`Represents how much of the borrowable asset (e.g., crvUSD) is currently available for new loans or withdrawals.`}
    />
  </TooltipWrapper>
)
