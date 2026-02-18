import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketBorrowRateTooltipWrapper } from '@/llamalend/widgets/tooltips/MarketBorrowRateTooltipWrapper'
import { Tooltip, TooltipProps } from '@ui-kit/shared/ui/Tooltip'

type BorrowRateTooltipProps = Pick<TooltipProps, 'children' | 'title'> & {
  market: LlamaMarket
}

export const BorrowRateTooltip = ({ market, title, children }: BorrowRateTooltipProps) => (
  <Tooltip clickable title={title} body={<MarketBorrowRateTooltipWrapper market={market} />} placement="top">
    {children}
  </Tooltip>
)
