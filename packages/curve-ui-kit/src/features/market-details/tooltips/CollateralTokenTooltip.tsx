import { t } from '@ui-kit/lib/i18n'
import { TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'

export const CollateralTokenTooltip = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Asset used as collateral to borrow in this market.`} />
    <TooltipDescription
      text={t`This token is deposited but does not earn lending yield directly, unless it's a yield bearing token.`}
    />
  </TooltipWrapper>
)
