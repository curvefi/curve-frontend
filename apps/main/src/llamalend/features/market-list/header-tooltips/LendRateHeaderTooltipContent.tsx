import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const LendRateHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`The annualized yield earned by lenders of the borrowable asset.`} />
    <TooltipDescription text={t`May include both interest and external incentives.`} />
    <TooltipDescription text={t`Does not apply to collateral.`} />
  </TooltipWrapper>
)
