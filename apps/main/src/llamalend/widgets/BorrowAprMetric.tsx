import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { TooltipOptions as defaultTooltipOptions } from '../features/market-details/tooltips'
import { useBorrowRateTooltipTitle } from '../features/market-list/hooks/useBorrowRateTooltipTitle'

type BorrowRateMetric = {
  rate: number | null | undefined
  averageRate: number | null | undefined
  averageRateLabel: string
  rebasingYield: number | null | undefined
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}

type BorrowAprMetricProps = {
  marketType: LlamaMarketType
  borrowRate: BorrowRateMetric | null | undefined
  collateralSymbol: string | null | undefined
  alignment?: MetricProps['alignment']
}

export const BorrowAprMetric = ({ marketType, borrowRate, collateralSymbol, alignment }: BorrowAprMetricProps) => {
  const title = useBorrowRateTooltipTitle({
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
              unit: { symbol: `% ${borrowRate?.averageRateLabel ?? ''} Avg`, position: 'suffix' },
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
            periodLabel={borrowRate?.averageRateLabel ?? ''}
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
