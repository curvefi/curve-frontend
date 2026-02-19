import { MarketBorrowRateType } from '@/llamalend/widgets/tooltips/constants'
import { MarketNetBorrowAprTooltipContent } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric, type MetricProps } from '@ui-kit/shared/ui/Metric'
import type { TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import type { LlamaMarketType } from '@ui-kit/types/market'

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

type NetBorrowAprMetricProps = {
  marketType: LlamaMarketType
  borrowRate: BorrowRateMetric | null | undefined
  collateralSymbol: string | null | undefined
  borrowRateType?: MarketBorrowRateType
  size?: MetricProps['size']
  alignment?: MetricProps['alignment']
  warning?: boolean
  tooltipOptions?: Pick<TooltipProps, 'placement' | 'arrow' | 'clickable'>
}

const DEFAULT_TOOLTIP_OPTIONS = {
  placement: 'top',
  arrow: false,
  clickable: true,
} as const satisfies Pick<TooltipProps, 'placement' | 'arrow' | 'clickable'>

export const NetBorrowAprMetric = ({
  marketType,
  borrowRate,
  collateralSymbol,
  size = 'medium',
  alignment,
  warning,
  tooltipOptions,
}: NetBorrowAprMetricProps) => {
  const title = t`Net borrow APR`
  return (
    <Metric
      size={size}
      alignment={alignment}
      label={title}
      value={borrowRate?.totalBorrowRate}
      loading={borrowRate?.totalBorrowRate == null && borrowRate?.loading}
      valueOptions={{ unit: 'percentage', ...(warning ? { color: 'warning' } : {}) }}
      notional={
        borrowRate?.totalAverageBorrowRate == null
          ? undefined
          : {
              value: borrowRate?.totalAverageBorrowRate,
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
        ...DEFAULT_TOOLTIP_OPTIONS,
        ...tooltipOptions,
      }}
    />
  )
}
