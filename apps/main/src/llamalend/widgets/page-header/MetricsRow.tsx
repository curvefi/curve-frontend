import {
  type BorrowRate,
  type SupplyRate,
  type AvailableLiquidity,
  MarketTypeSuffix,
  MarketNetBorrowAprTooltipContent,
  MarketSupplyRateTooltipContent,
  AvailableLiquidityTooltip,
  TooltipOptions,
} from '@/llamalend/features/market-details'
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
      direction={{ mobile: 'column', tablet: 'row' }}
      sx={{
        gap: { mobile: Spacing.md.mobile, tablet: Spacing.xxl.tablet },
      }}
    >
      <Metric
        alignment={metricAlignment}
        label={t`Net borrow APR`}
        value={borrowRate?.totalBorrowRate}
        loading={borrowRate?.totalBorrowRate == null && borrowRate?.loading}
        valueOptions={{ unit: 'percentage' }}
        notional={
          borrowRate?.totalAverageBorrowRate
            ? {
                value: borrowRate.totalAverageBorrowRate,
                unit: { symbol: `% ${borrowRate.averageRateLabel} Avg`, position: 'suffix' },
              }
            : undefined
        }
        valueTooltip={{
          title: t`Net borrow APR`,
          body: (
            <MarketNetBorrowAprTooltipContent
              marketType={marketType}
              borrowRate={borrowRate?.rate}
              totalBorrowRate={borrowRate?.totalBorrowRate}
              totalAverageBorrowRate={borrowRate?.totalAverageBorrowRate}
              averageRate={borrowRate?.averageRate}
              periodLabel={borrowRate?.averageRateLabel}
              extraRewards={borrowRate?.extraRewards ?? []}
              rebasingYield={borrowRate?.rebasingYield}
              collateralSymbol={collateral?.symbol}
              isLoading={borrowRate?.loading}
            />
          ),
          ...TooltipOptions,
        }}
      />
      {supplyRate && (
        <Metric
          alignment={metricAlignment}
          label={t`Supply rate`}
          value={supplyRate?.totalSupplyRateMinBoost}
          loading={supplyRate?.totalSupplyRateMinBoost == null && supplyRate?.loading}
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
        loading={availableLiquidity?.value == null && availableLiquidity?.loading}
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
