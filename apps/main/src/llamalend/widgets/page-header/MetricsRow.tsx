import { MarketTypeSuffix, NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { MarketSupplyRateTooltipContent, AvailableLiquidityTooltip, TooltipOptions } from '@/llamalend/widgets/tooltips'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import type { AvailableLiquidity, BorrowRate, SupplyRate } from './hooks/usePageHeader'

const { Spacing } = SizesAndSpaces

export const MetricsRow = ({
  borrowRate,
  supplyRate,
  availableLiquidity,
  marketType,
  collateral,
}: {
  borrowRate: QueryProp<BorrowRate>
  supplyRate?: QueryProp<SupplyRate>
  availableLiquidity: QueryProp<AvailableLiquidity>
  marketType: LlamaMarketType
  collateral: { symbol: string } | undefined
}) => {
  const isMobile = useIsMobile()
  const metricAlignment = isMobile ? 'start' : 'end'
  const supplyRatePeriod = supplyRate?.data ? AVERAGE_CATEGORIES[supplyRate.data.averageCategory].period : null

  return (
    <Stack
      direction="row"
      sx={{
        display: { mobile: 'grid', tablet: 'flex' },
        gridTemplateColumns: '1fr 1fr',
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
          value={mapQuery(supplyRate, supplyRate => supplyRate.totalMinBoost)}
          valueOptions={{ unit: 'percentage' }}
          notional={maybe(supplyRate.data?.totalAverageMinBoost, data => ({
            value: data,
            unit: { symbol: `% ${supplyRatePeriod} Avg`, position: 'suffix' },
          }))}
          valueTooltip={{
            title: NET_SUPPLY_RATE_TITLE,
            body: (
              <MarketSupplyRateTooltipContent
                supplyApy={supplyRate.data?.supplyApy}
                averageSupplyApy={supplyRate.data?.averageLendApy}
                totalApy={supplyRate.data?.totalMinBoost}
                totalAverageApy={supplyRate.data?.totalAverageMinBoost}
                boost={{
                  type: 'market',
                  apy: supplyRate.data?.supplyApyCrvMaxBoost,
                  totalApy: supplyRate.data?.totalMaxBoost,
                  totalAverageApy: supplyRate.data?.totalAverageMaxBoost,
                }}
                rebasingYieldApy={supplyRate.data?.rebasingYield}
                isLoading={supplyRate.isLoading}
                periodLabel={supplyRatePeriod!}
                extraRewards={supplyRate.data?.extraRewards ?? []}
                extraIncentives={supplyRate.data?.extraIncentives ?? []}
              />
            ),
            ...TooltipOptions,
          }}
        />
      )}
      <Metric
        alignment={metricAlignment}
        label={t`Available liquidity`}
        value={mapQuery(availableLiquidity, availableLiquidity => availableLiquidity.value)}
        valueOptions={{ unit: 'none' }} // We could've shown the supply token symbol, but it's a bit ugly and it's implicit anyway
        valueTooltip={{
          title: t`Available Liquidity ${MarketTypeSuffix[marketType]}`,
          body: <AvailableLiquidityTooltip marketType={marketType} />,
          ...TooltipOptions,
        }}
        notional={maybe(availableLiquidity.data?.notional, x => ({
          value: x,
          unit: 'dollar',
        }))}
      />
    </Stack>
  )
}
