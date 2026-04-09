import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import type { LlamaMarketType } from '@ui-kit/types/market'
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
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}

type BorrowAprMetricProps = {
  marketType: LlamaMarketType
  borrowRate: BorrowRateMetric
  collateralSymbol: string | null | undefined
  alignment?: MetricProps['alignment']
}

export const BorrowAprMetric = ({ marketType, borrowRate, collateralSymbol, alignment }: BorrowAprMetricProps) => {
  const averageRatePeriod = AVERAGE_CATEGORIES[borrowRate.averageCategory].period
  const title = getBorrowRateTooltipTitle({
    totalBorrowApr: borrowRate?.totalBorrowRate,
    extraRewards: borrowRate?.extraRewards ?? [],
    rebasingYieldApr: borrowRate?.rebasingYield,
  })
  return (
    <Metric
      size="medium"
      alignment={alignment}
      label={t`Borrow APR`}
      value={borrowRate?.rate}
      loading={borrowRate?.rate == null && borrowRate?.loading}
      valueOptions={{ unit: 'percentage' }}
      notional={
        borrowRate?.averageRate == null
          ? undefined
          : {
              value: borrowRate.averageRate,
              unit: { symbol: `% ${averageRatePeriod} Avg`, position: 'suffix' },
            }
      }
      valueTooltip={{
        title,
        body: (
          <MarketNetBorrowAprTooltipContent
            marketType={marketType}
            borrowApr={borrowRate?.rate}
            totalBorrowApr={borrowRate?.totalBorrowRate}
            totalAverageBorrowApr={borrowRate?.totalAverageBorrowRate}
            averageApr={borrowRate?.averageRate}
            periodLabel={averageRatePeriod}
            extraRewards={borrowRate?.extraRewards ?? []}
            rebasingYieldApr={borrowRate?.rebasingYield}
            collateralSymbol={collateralSymbol}
            isLoading={borrowRate?.loading}
          />
        ),
        ...defaultTooltipOptions,
      }}
    />
  )
}
