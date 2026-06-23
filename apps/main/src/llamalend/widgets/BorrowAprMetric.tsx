import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { maybe } from '@primitives/objects.utils'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, type AverageCategory } from '@ui-kit/utils'
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
  marketType: LlamaMarketType
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
      size="medium"
      alignment={alignment}
      testId="market-net-borrow-apr"
      label={t`Net Borrow APR`}
      value={mapQuery(borrowRate, borrowRate => borrowRate.totalBorrowRate)}
      valueOptions={{ unit: 'percentage' }}
      notional={maybe(borrowRate.data?.totalAverageBorrowRate, data => ({
        value: data,
        unit: { symbol: `% ${averageRatePeriod} Avg`, position: 'suffix' },
      }))}
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
