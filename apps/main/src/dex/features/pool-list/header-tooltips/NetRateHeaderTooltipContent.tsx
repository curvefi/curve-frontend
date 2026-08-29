import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'

export const NetRateHeaderTooltipContent = () => {
  const rateDisplay = useRateDisplay()

  return (
    <TooltipWrapper>
      <TooltipDescription text={t`Estimated net annualized yield for the pool.`} />
      <TooltipDescription
        text={
          rateDisplay === 'apy'
            ? t`Net APY is the sum of Base APY, unboosted CRV gauge APY, and Rewards APY.`
            : t`Net APR is the sum of Base APR, unboosted CRV gauge APR, and Rewards APR.`
        }
      />
      <TooltipDescription text={t`Points are excluded because they are not percentage-based yield.`} />
    </TooltipWrapper>
  )
}
