import { BORROW_RATE_TITLE } from '@/llamalend/constants'
import { MarketBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketBorrowAprTooltipContent'
import { AVERAGE_CATEGORIES, type AverageCategory } from '@evm-ui/utils'
import { maybe, type Nullish } from '@primitives/objects.utils'
import { Metric, type MetricProps } from '@ui/components/Metric'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { formatCappedRateValue } from '@ui/lib/rates.utils'
import { formatEstimatedNetBorrowRate } from '../llama.utils'
import { TooltipOptions as defaultTooltipOptions } from './tooltips/tooltip.utils'

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
  borrowRate: QueryProp<BorrowRateMetric>
  collateralSymbol: string | Nullish
  alignment?: MetricProps['alignment']
}

export const BorrowAprMetric = ({ borrowRate, collateralSymbol, alignment }: BorrowAprMetricProps) => {
  const averageRatePeriod = AVERAGE_CATEGORIES[borrowRate.data?.averageCategory ?? 'llamalend.market.rate'].period
  return (
    <Metric
      category="llamalend.marketHeader"
      alignment={alignment}
      testId="market-borrow-apr"
      label={BORROW_RATE_TITLE}
      value={mapQuery(borrowRate, ({ rate }) => rate)}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      notional={mapQuery(borrowRate, ({ totalBorrowRate }) => maybe(totalBorrowRate, formatEstimatedNetBorrowRate))}
      valueTooltip={{
        title: BORROW_RATE_TITLE,
        body: (
          <MarketBorrowAprTooltipContent
            borrowApr={borrowRate.data?.rate}
            totalBorrowApr={borrowRate.data?.totalBorrowRate}
            totalAverageBorrowApr={borrowRate.data?.totalAverageBorrowRate}
            averageApr={borrowRate.data?.averageRate}
            periodLabel={averageRatePeriod}
            extraRewards={borrowRate.data?.extraRewards}
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
