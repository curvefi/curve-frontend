import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { t } from '@evm-ui/lib/i18n'
import { Metric, type MetricProps } from '@evm-ui/shared/ui/Metric'
import type { MarketType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES, type AverageCategory, formatCappedRateValue } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { getBorrowRateTooltipTitle } from '../llama.utils'
import { TooltipOptions as defaultTooltipOptions } from './tooltips'

type BorrowRateMetric = {
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageCategory: AverageCategory
  rebasingYield: number | null | undefined
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  extraRewards: CampaignRewards[]
}

type BorrowAprMetricProps = {
  marketType: MarketType
  borrowRate: QueryProp<BorrowRateMetric>
  collateralSymbol: string | null | undefined
  alignment?: MetricProps['alignment']
}

export const BorrowAprMetric = ({ marketType, borrowRate, collateralSymbol, alignment }: BorrowAprMetricProps) => {
  const averageRatePeriod = AVERAGE_CATEGORIES[borrowRate.data?.averageCategory ?? 'llamalend.market.rate'].period
  const title = getBorrowRateTooltipTitle({
    totalBorrowApr: borrowRate.data?.totalBorrowRate,
    extraRewards: borrowRate.data?.extraRewards ?? [],
    rebasingYieldApr: borrowRate.data?.rebasingYield,
  })
  return (
    <Metric
      category="llamalend.marketHeader"
      alignment={alignment}
      testId="market-net-borrow-apr"
      label={t`Net Borrow APR`}
      value={mapQuery(borrowRate, ({ totalBorrowRate }) => totalBorrowRate)}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      notional={mapQuery(borrowRate, ({ totalAverageBorrowRate: data }) =>
        maybe(data, value => ({
          value,
          abbreviate: false,
          formatter: formatCappedRateValue,
          unit: { symbol: `% ${averageRatePeriod} Avg`, position: 'suffix' as const },
        })),
      )}
      valueTooltip={{
        title,
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
