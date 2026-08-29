import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const CrvRateHeaderTooltipContent = () => {
  const rateDisplay = useRateDisplay()

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={
          rateDisplay === 'apy'
            ? t`CRV gauge reward APY shown from the unboosted rate to the maximum boosted rate.`
            : t`CRV gauge reward APR shown from the unboosted rate to the maximum boosted rate.`
        }
      />
      <TooltipDescription text={t`The maximum rate assumes the full 2.5x gauge boost.`} />
      <TooltipDescription
        text={t`The range is unavailable for inactive gauges or when either rate is missing or zero.`}
      />
    </TooltipWrapper>
  )
}
