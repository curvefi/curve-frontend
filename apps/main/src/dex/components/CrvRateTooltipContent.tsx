import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import { formatNumber, MAINNET_CRV } from '@evm-ui/utils'

export const CrvRateTooltipContent = ({
  maximumRate,
  unboostedRate,
}: {
  maximumRate: number | null | undefined
  unboostedRate: number | null | undefined
}) => {
  const rateDisplay = useRateDisplay()

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={
          rateDisplay === 'apy'
            ? t`CRV gauge reward APY ranges from the unboosted rate to the maximum boosted rate.`
            : t`CRV gauge reward APR ranges from the unboosted rate to the maximum boosted rate.`
        }
      />
      <TooltipDescription text={t`The maximum rate assumes the full 2.5x gauge boost.`} />
      <TooltipItems secondary>
        <TooltipItem
          title={t`Unboosted`}
          titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
          variant="independent"
        >
          {formatNumber(unboostedRate, 'percent.rate')}
        </TooltipItem>
        <TooltipItem
          title={t`Max boost`}
          titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
          variant="independent"
        >
          {formatNumber(maximumRate, 'percent.rate')}
        </TooltipItem>
      </TooltipItems>
    </TooltipWrapper>
  )
}
