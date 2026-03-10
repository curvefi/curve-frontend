import {
  type BorrowRate,
  type SupplyRate,
  type AvailableLiquidity,
  MarketTypeSuffix,
  MarketSupplyRateTooltipContent,
  AvailableLiquidityTooltip,
  TooltipOptions,
} from '@/llamalend/features/market-details'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'

const { Spacing } = SizesAndSpaces

type MetricRowProps = {
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
  marketType: LlamaMarketType
  collateral: { symbol: string } | undefined
}

export const MetricsRow = ({ borrowRate, supplyRate, availableLiquidity, marketType, collateral }: MetricRowProps) => {
  const isMobile = useIsMobile()
  const metricAlignment = isMobile ? 'start' : 'end'

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
          label={t`Supply rate`}
          value={supplyRate?.totalSupplyRateMinBoost}
          loading={supplyRate?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={
            supplyRate?.averageRate
              ? {
                  value: supplyRate.averageRate,
                  unit: { symbol: `% ${supplyRate.averageRateLabel} Avg`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Supply Rate`,
            body: (
              <MarketSupplyRateTooltipContent
                supplyRate={supplyRate?.rate}
                averageRate={supplyRate?.averageRate}
                minBoostApr={supplyRate?.supplyAprCrvMinBoost}
                maxBoostApr={supplyRate?.supplyAprCrvMaxBoost}
                totalSupplyRateMinBoost={supplyRate?.totalSupplyRateMinBoost}
                totalSupplyRateMaxBoost={supplyRate?.totalSupplyRateMaxBoost}
                totalAverageSupplyRateMinBoost={supplyRate?.totalAverageSupplyRateMinBoost}
                totalAverageSupplyRateMaxBoost={supplyRate?.totalAverageSupplyRateMaxBoost}
                rebasingYield={supplyRate?.rebasingYield}
                isLoading={supplyRate?.loading}
                periodLabel={supplyRate?.averageRateLabel}
                extraRewards={supplyRate?.extraRewards ?? []}
                extraIncentives={supplyRate?.extraIncentives ?? []}
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
