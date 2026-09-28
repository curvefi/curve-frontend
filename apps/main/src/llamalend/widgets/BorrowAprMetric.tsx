import { getBorrowRateTooltipTitle } from '@/llamalend/llama.utils'
import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import type { MarketType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES, type AverageCategory, formatCappedRateValue } from '@evm-ui/utils'
import { type Nullish, maybe } from '@primitives/objects.utils'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { TooltipOptions as defaultTooltipOptions } from './tooltips'

type BorrowRateMetric = {
  rate: number | Nullish
  averageRate: number | Nullish
  averageCategory: AverageCategory
  rebasingYield: number | Nullish
  totalBorrowRate: number | Nullish
  totalAverageBorrowRate: number | Nullish
  extraRewards: CampaignRewards[]
}

type BorrowAprMetricProps = {
  marketType: MarketType
  borrowRate: QueryProp<BorrowRateMetric>
  collateralSymbol: string | Nullish
  alignment?: MetricProps['alignment']
}

export const BorrowAprMetric = ({ marketType, borrowRate, collateralSymbol, alignment }: BorrowAprMetricProps) => {
  const beta = useNewLlamalendHealth()
  const averageRatePeriod = AVERAGE_CATEGORIES[borrowRate.data?.averageCategory ?? 'llamalend.market.rate'].period
  const legacyTitle = getBorrowRateTooltipTitle({
    totalBorrowApr: borrowRate.data?.totalBorrowRate,
    extraRewards: borrowRate.data?.extraRewards ?? [],
    rebasingYieldApr: borrowRate.data?.rebasingYield,
  })
  return (
    <Metric
      category="llamalend.marketHeader"
      alignment={alignment}
      testId="market-net-borrow-apr"
      label={beta ? t`Borrow APR` : t`Net Borrow APR`}
      value={mapQuery(borrowRate, ({ rate, totalBorrowRate }) => (beta ? rate : totalBorrowRate))}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      notional={mapQuery(borrowRate, ({ totalBorrowRate, totalAverageBorrowRate }) =>
        maybe(beta ? totalBorrowRate : totalAverageBorrowRate, value => ({
          value,
          abbreviate: false,
          formatter: formatCappedRateValue,
          unit: { symbol: beta ? `% ${t`Net borrow APR`}` : `% ${averageRatePeriod} Avg`, position: 'suffix' as const },
        })),
      )}
      valueTooltip={{
        title: beta ? t`Borrow APR` : legacyTitle,
        body: (
          <MarketNetBorrowAprTooltipContent
            marketType={marketType}
            borrowApr={borrowRate.data?.rate}
            totalBorrowApr={borrowRate.data?.totalBorrowRate}
            totalAverageBorrowApr={borrowRate.data?.totalAverageBorrowRate}
            averageApr={borrowRate.data?.averageRate}
            periodLabel={averageRatePeriod}
            extraRewards={borrowRate.data?.extraRewards ?? []}
            rebasingYieldApr={borrowRate.data?.rebasingYield}
            collateralSymbol={collateralSymbol}
            isLoading={borrowRate.isLoading}
          />
        ),
        ...defaultTooltipOptions,
      }}
    />
  )
}
