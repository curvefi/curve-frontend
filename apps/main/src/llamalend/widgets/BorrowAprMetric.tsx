import { BORROW_RATE_TITLE } from '@/llamalend/constants'
import { MarketBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketBorrowAprTooltipContent'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import type { Nullish } from '@primitives/objects.utils'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { formatCappedRateValue } from '@ui/lib/rates.utils'
import { formatEstimatedNetBorrowRate, hasEstimatedNetBorrowApr } from '../llama.utils'
import type { BorrowRate } from './page-header/hooks/usePageHeader'
import { TooltipOptions as defaultTooltipOptions } from './tooltips/tooltip.utils'

type BorrowAprMetricProps = {
  borrowRate: QueryProp<BorrowRate>
  collateralSymbol: string | Nullish
  alignment?: MetricProps['alignment']
}

export const BorrowAprMetric = ({ borrowRate, collateralSymbol, alignment }: BorrowAprMetricProps) => {
  const averageRatePeriod = AVERAGE_CATEGORIES[borrowRate.data?.averageCategory ?? 'llamalend.market.rate'].period
  const showNetBorrowApr = borrowRate.data?.totalBorrowRate != null && hasEstimatedNetBorrowApr(borrowRate.data)
  return (
    <Metric
      category="llamalend.marketHeader"
      alignment={alignment}
      testId="market-borrow-apr"
      label={BORROW_RATE_TITLE}
      value={mapQuery(borrowRate, ({ rate }) => rate)}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      {...(showNetBorrowApr && {
        notional: mapQuery(borrowRate, ({ totalBorrowRate }) => formatEstimatedNetBorrowRate(totalBorrowRate)),
      })}
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
            collateralYields={borrowRate.data?.collateralYields}
            collateralSymbol={collateralSymbol}
            isLoading={borrowRate.isLoading}
          />
        ),
        ...defaultTooltipOptions,
      }}
    />
  )
}
