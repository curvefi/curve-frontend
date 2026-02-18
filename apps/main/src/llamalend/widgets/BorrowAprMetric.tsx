import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import type { TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { TooltipOptions as defaultTooltipOptions } from '../features/market-details/tooltips'

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
  size?: MetricProps['size']
  alignment?: MetricProps['alignment']
  warning?: boolean
  tooltipOptions?: Pick<TooltipProps, 'placement' | 'arrow' | 'clickable'>
}

export const BorrowAprMetric = ({
  marketType,
  borrowRate,
  collateralSymbol,
  size = 'medium',
  alignment,
  warning,
  tooltipOptions,
}: BorrowAprMetricProps) => {
  const title = t`Borrow APR`
  return (
    <Metric
      size={size}
      alignment={alignment}
      label={title}
      value={borrowRate?.rate}
      loading={borrowRate?.rate == null && borrowRate?.loading}
      valueOptions={{ unit: 'percentage', ...(warning ? { color: 'warning' } : {}) }}
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
            borrowRate={borrowRate?.rate}
            totalBorrowRate={borrowRate?.totalBorrowRate}
            totalAverageBorrowRate={borrowRate?.totalAverageBorrowRate}
            averageRate={borrowRate?.averageRate}
            periodLabel={borrowRate?.averageRateLabel ?? ''}
            extraRewards={borrowRate?.extraRewards ?? []}
            rebasingYield={borrowRate?.rebasingYield}
            collateralSymbol={collateralSymbol}
            isLoading={borrowRate?.loading}
          />
        ),
        ...defaultTooltipOptions,
        ...tooltipOptions,
      }}
    />
  )
}
