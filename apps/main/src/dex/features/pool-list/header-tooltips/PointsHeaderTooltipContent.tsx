import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const PointsHeaderTooltipContent = () => {
  const rateDisplay = useRateDisplay()

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={
          rateDisplay === 'apy'
            ? t`Non-APY rewards offered through external campaigns.`
            : t`Non-APR rewards offered through external campaigns.`
        }
      />
      <TooltipDescription text={t`Values may appear as a multiplier, campaign symbol, or ‘Points’.`} />
      <TooltipDescription
        text={
          rateDisplay === 'apy'
            ? t`Points are tracked separately and are not included in APY calculations.`
            : t`Points are tracked separately and are not included in APR calculations.`
        }
      />
    </TooltipWrapper>
  )
}
