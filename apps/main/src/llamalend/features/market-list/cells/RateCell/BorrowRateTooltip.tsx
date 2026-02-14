import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketBorrowRateTooltipWrapper } from '@/llamalend/widgets/tooltips/MarketBorrowRateTooltipWrapper'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, TooltipProps } from '@ui-kit/shared/ui/Tooltip'

type BorrowRateTooltipProps = Pick<TooltipProps, 'children'> & {
  market: LlamaMarket
}

export const BorrowRateTooltip = ({ market, children }: BorrowRateTooltipProps) => (
  <Tooltip
    clickable
    title={t`Net borrow APR`}
    body={<MarketBorrowRateTooltipWrapper market={market} />}
    placement="top"
  >
    {children}
  </Tooltip>
)
