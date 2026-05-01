import { MarketTypeSuffix, NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { MarketSupplyRateTooltipContent, AvailableLiquidityTooltip, TooltipOptions } from '@/llamalend/widgets/tooltips'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import type { AvailableLiquidity } from './hooks/usePageHeader'

const { Spacing } = SizesAndSpaces

export const MetricsRow = ({
  borrowRate,
  supplyRate,
  availableLiquidity,
  marketType,
  collateral,
}: {
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
  marketType: LlamaMarketType
  collateral: { symbol: string } | undefined
}) => {
  const isMobile = useIsMobile()
  const metricAlignment = isMobile ? 'start' : 'end'
  const supplyRatePeriod = supplyRate ? AVERAGE_CATEGORIES[supplyRate.averageCategory].period : null

  return (
    <Stack
      display={{ mobile: 'grid', tablet: 'flex' }}
      gridTemplateColumns="1fr 1fr"
      direction="row"
      sx={{
        gap: { mobile: Spacing.md.mobile, tablet: Spacing.xxl.tablet },
      }}
    >
      <BorrowAprMetric
        marketType={marketType}
        borrowRate={borrowRate}
        collateralSymbol={collateral?.symbol}
        alignment={metricAlignment}
      />
      {supplyRate && (
        <Metric
          alignment={metricAlignment}
          label={NET_SUPPLY_RATE_TITLE}
          value={supplyRate.totalMinBoost}
          loading={supplyRate.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={
            supplyRate.totalAverageMinBoost != null
              ? {
                  value: supplyRate.totalAverageMinBoost,
                  unit: { symbol: `% ${supplyRatePeriod} Avg`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: NET_SUPPLY_RATE_TITLE,
            body: (
              <MarketSupplyRateTooltipContent
                supplyApy={supplyRate.supplyApy}
                averageSupplyApy={supplyRate.averageLendApy}
                totalApy={supplyRate.totalMinBoost}
                totalAverageApy={supplyRate.totalAverageMinBoost}
                boost={{
                  type: 'market',
                  apy: supplyRate.supplyApyCrvMaxBoost,
                  totalApy: supplyRate.totalMaxBoost,
                  totalAverageApy: supplyRate.totalAverageMaxBoost,
                }}
                rebasingYieldApy={supplyRate.rebasingYield}
                isLoading={supplyRate.loading}
                periodLabel={supplyRatePeriod!}
                extraRewards={supplyRate.extraRewards ?? []}
                extraIncentives={supplyRate.extraIncentives ?? []}
              />
            ),
            ...TooltipOptions,
          }}
        />
      )}
      <Metric
        alignment={metricAlignment}
        label={t`Available liquidity`}
        value={availableLiquidity?.value}
        loading={availableLiquidity?.loading}
        valueOptions={{ unit: 'dollar' }}
        valueTooltip={{
          title: t`Available Liquidity ${MarketTypeSuffix[marketType]}`,
          body: <AvailableLiquidityTooltip marketType={marketType} />,
          ...TooltipOptions,
        }}
      />
    </Stack>
  )
}
