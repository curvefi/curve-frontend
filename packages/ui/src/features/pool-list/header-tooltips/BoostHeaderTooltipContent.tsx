import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'

export const BoostHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={t`Your veCRV boost multiplier for CRV rewards on staked liquidity.`} />
    <TooltipDescription text={t`Boost data is currently available on Ethereum.`} />
  </TooltipWrapper>
)
