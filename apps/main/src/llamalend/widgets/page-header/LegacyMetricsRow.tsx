import { MarketTypeSuffix } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { MarketSupplyRateTooltipContent, AvailableLiquidityTooltip, TooltipOptions } from '@/llamalend/widgets/tooltips'
import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketType } from '@evm-ui/types/market'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import type { AvailableLiquidity, BorrowRate, SupplyRate } from './hooks/usePageHeader'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketHeader'

export const LegacyMetricsRow = ({
  borrowRate,
  supplyRate,
  availableLiquidity,
  marketType,
  collateral,
  borrowToken,
}: {
  borrowRate: QueryProp<BorrowRate>
  supplyRate?: QueryProp<SupplyRate>
  availableLiquidity: AvailableLiquidity
  marketType: MarketType
  collateral: { symbol: string } | undefined
  borrowToken: { symbol: string } | undefined
}) => {
  const rateDisplay = useRateDisplay()
  const netSupplyRateTitle = rateDisplay === 'apy' ? t`Net Supply APY` : t`Net Supply APR`
  const supplyRatePeriod = supplyRate?.data ? AVERAGE_CATEGORIES[supplyRate.data.averageCategory].period : null

  return (
    <Stack
      direction="row"
      sx={{
        display: { mobile: 'grid', desktop: 'flex' },
        gridTemplateColumns: { mobile: 'repeat(2, minmax(0, 1fr))', desktop: 'none' },
        columnGap: Spacing.xxl,
        rowGap: Spacing.md,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'start',
      }}
    >
      <BorrowAprMetric marketType={marketType} borrowRate={borrowRate} collateralSymbol={collateral?.symbol} />
      {supplyRate && (
        <Metric
          category={METRIC_CATEGORY}
          testId="market-net-supply-rate"
          label={netSupplyRateTitle}
          value={mapQuery(supplyRate, supplyRate => supplyRate.totalMinBoost)}
          valueOptions={{ unit: 'percentage' }}
          notional={mapQuery(supplyRate, ({ totalAverageMinBoost: data }) =>
            maybe(data, value => ({
              value,
              unit: { symbol: `% ${supplyRatePeriod} Avg`, position: 'suffix' as const },
            })),
          )}
          valueTooltip={{
            title: netSupplyRateTitle,
            body: (
              // todo: implement loading/error states for tooltip
              <MarketSupplyRateTooltipContent
                supplyRate={supplyRate.data?.supplyRate}
                averageSupplyRate={supplyRate.data?.averageLendRate}
                totalRate={supplyRate.data?.totalMinBoost}
                totalAverageRate={supplyRate.data?.totalAverageMinBoost}
                boost={{
                  type: 'market',
                  rate: supplyRate.data?.supplyRateCrvMaxBoost,
                  totalRate: supplyRate.data?.totalMaxBoost,
                  totalAverageRate: supplyRate.data?.totalAverageMaxBoost,
                }}
                rebasingYieldRate={supplyRate.data?.rebasingYieldRate}
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
      {marketType === MarketType.Lend && (
        <Metric
          category={METRIC_CATEGORY}
          testId="market-total-liquidity"
          label={t`Total liquidity`}
          {...tokenMetric({
            value: availableLiquidity.total,
            symbol: borrowToken?.symbol,
            usdRate: availableLiquidity.usdRate,
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
          value: availableLiquidity.value,
          symbol: borrowToken?.symbol,
          usdRate: availableLiquidity.usdRate,
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
