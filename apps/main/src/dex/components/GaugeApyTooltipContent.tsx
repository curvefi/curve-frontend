import Box from '@mui/material/Box'
import { t } from '@ui-kit/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'

type GaugeApyTooltipContentProps = {
  maximumApy: number | null | undefined
  unboostedApy: number | null | undefined
}

export const GaugeApyTooltipContent = ({ maximumApy, unboostedApy }: GaugeApyTooltipContentProps) => (
  <Box data-testid="pool-gauge-apy-tooltip-content">
    <TooltipWrapper>
      <TooltipDescription text={t`CRV gauge reward APY ranges from the unboosted rate to the maximum boosted rate.`} />
      <TooltipDescription text={t`The maximum rate assumes the full 2.5x gauge boost.`} />
      <TooltipItems secondary>
        <TooltipItem title={t`Gauge APY`} />
        <TooltipItem
          variant="subItem"
          title={t`Unboosted`}
          titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
        >
          {formatNumber(unboostedApy || null, 'percent.rate')}
        </TooltipItem>
        <TooltipItem
          variant="subItem"
          title={t`Max boost`}
          titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
        >
          {formatNumber(maximumApy || null, 'percent.rate')}
        </TooltipItem>
      </TooltipItems>
    </TooltipWrapper>
  </Box>
)
