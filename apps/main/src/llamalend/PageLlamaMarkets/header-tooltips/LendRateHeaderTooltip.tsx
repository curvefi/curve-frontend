import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'

export default (
  <TooltipWrapper>
    <TooltipDescription text={t`The annualized yield earned by lenders of the borrowable asset.`} />
    <TooltipDescription text={t`May include both interest and external incentives.`} />
    <TooltipDescription text={t`Does not apply to collateral.`} />
  </TooltipWrapper>
)
