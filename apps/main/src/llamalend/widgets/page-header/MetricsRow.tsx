import { MarketTypeSuffix, NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { MarketSupplyRateTooltipContent, AvailableLiquidityTooltip, TooltipOptions } from '@/llamalend/widgets/tooltips'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import type { AvailableLiquidity, BorrowRate, SupplyRate } from './hooks/usePageHeader'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketHeader'

export const MetricsRow = ({
  borrowRate,
  supplyRate,
  availableLiquidity,
  marketType,
  collateral,
  borrowToken,
}: {
  borrowRate: QueryProp<BorrowRate>
  supplyRate?: QueryProp<SupplyRate>
  availableLiquidity: QueryProp<AvailableLiquidity>
  marketType: LlamaMarketType
  collateral: { symbol: string } | undefined
  borrowToken: { symbol: string } | undefined
}) => {
  const supplyRatePeriod = supplyRate?.data ? AVERAGE_CATEGORIES[supplyRate.data.averageCategory].period : null

  return (
    <Stack
      direction="row"
      sx={{
        display: { mobile: 'grid', desktop: 'flex' },
        gridTemplateColumns: { mobile: 'repeat(2, minmax(0, 1fr))', desktop: 'none' },
        columnGap: Spacing.xxl,
        rowGap: { mobile: Spacing.lg, desktop: Spacing.xxl },
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'start',
      }}
    >
      <BorrowAprMetric
        marketType={marketType}
        borrowRate={borrowRate}
        collateralSymbol={collateral?.symbol}
      />
      {supplyRate && (
        <Metric
          category={METRIC_CATEGORY}
          testId="market-net-supply-apy"
          label={NET_SUPPLY_RATE_TITLE}
          value={mapQuery(supplyRate, supplyRate => supplyRate.totalMinBoost)}
          valueOptions={{ unit: 'percentage' }}
          notional={mapQuery(supplyRate, ({ totalAverageMinBoost: data }) =>
            maybe(data, value => ({
              value,
              unit: { symbol: `% ${supplyRatePeriod} Avg`, position: 'suffix' as const },
            })),
          )}
          valueTooltip={{
            title: NET_SUPPLY_RATE_TITLE,
            body: (
              // todo: implement loading/error states for tooltip
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
      {marketType === LlamaMarketType.Lend && (
        <Metric
          category={METRIC_CATEGORY}
          testId="market-total-liquidity"
          label={t`Total liquidity`}
          {...tokenMetric({
            value: mapQuery(availableLiquidity, d => d.total),
            symbol: borrowToken?.symbol,
            usdRate: mapQuery(availableLiquidity, d => d.usdRate),
          })}
          valueTooltip={{
            title: t`Total liquidity`,
            body: t`Total liquidity is the total amount of the borrow token supplied to this lending market, including both available and borrowed liquidity.`,
            ...TooltipOptions,
          }}
        />
      )}
      <Metric
        category={METRIC_CATEGORY}
        testId="market-available-liquidity"
        label={t`Available liquidity`}
        {...tokenMetric({
          value: mapQuery(availableLiquidity, d => d.value),
          symbol: borrowToken?.symbol,
          usdRate: mapQuery(availableLiquidity, d => d.usdRate),
        })}
        valueTooltip={{
          title: t`Available Liquidity ${MarketTypeSuffix[marketType]}`,
          body: <AvailableLiquidityTooltip marketType={marketType} />,
          ...TooltipOptions,
        }}
      />
    </Stack>
  )
}
