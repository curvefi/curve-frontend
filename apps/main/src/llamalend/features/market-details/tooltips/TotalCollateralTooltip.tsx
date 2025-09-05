import { TooltipWrapper, TooltipDescription } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'

export const TotalCollateralTooltip = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The total USD value of all collateral assets deposited in this market.`} />
    <TooltipDescription text={t`Used as backing for borrowed or minted debt (e.g., crvUSD).`} />
    <TooltipDescription
      text={t`This includes both active positions and collateral currently in the liquidation band (being gradually converted).`}
    />
  </TooltipWrapper>
)
