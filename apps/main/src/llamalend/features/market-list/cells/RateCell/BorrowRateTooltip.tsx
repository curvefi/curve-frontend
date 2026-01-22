import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketBorrowRateType } from '@/llamalend/widgets/tooltips/constants'
import { MarketBorrowRateTooltipWrapper } from '@/llamalend/widgets/tooltips/MarketBorrowRateTooltipWrapper'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { LlamaMarketColumnId } from '../../columns'

type BorrowRateTooltipProps = Pick<TooltipProps, 'children'> & {
  market: LlamaMarket
  columnId: LlamaMarketColumnId.BorrowRate | LlamaMarketColumnId.NetBorrowRate
}
const borrowRateType: Record<LlamaMarketColumnId.BorrowRate | LlamaMarketColumnId.NetBorrowRate, MarketBorrowRateType> =
  {
    [LlamaMarketColumnId.BorrowRate]: MarketBorrowRateType.BorrowApr,
    [LlamaMarketColumnId.NetBorrowRate]: MarketBorrowRateType.NetBorrowApr,
  }

export const BorrowRateTooltip = ({ market, columnId, children }: BorrowRateTooltipProps) => (
  <Tooltip
    clickable
    title={columnId === LlamaMarketColumnId.BorrowRate ? t`Borrow APR` : t`Net borrow APR`}
    body={<MarketBorrowRateTooltipWrapper market={market} borrowRateType={borrowRateType[columnId]} />}
    placement="top"
  >
    {children}
  </Tooltip>
)
