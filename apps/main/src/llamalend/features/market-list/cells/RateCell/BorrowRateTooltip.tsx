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

type BorrowRateTooltipConfig = {
  title: string
  type: MarketBorrowRateType
}

const borrowRateTooltipConfig: Record<
  LlamaMarketColumnId.BorrowRate | LlamaMarketColumnId.NetBorrowRate,
  BorrowRateTooltipConfig
> = {
  [LlamaMarketColumnId.BorrowRate]: {
    title: t`Borrow APR`,
    type: MarketBorrowRateType.BorrowApr,
  },
  [LlamaMarketColumnId.NetBorrowRate]: {
    title: t`Net borrow APR`,
    type: MarketBorrowRateType.NetBorrowApr,
  },
}

export const BorrowRateTooltip = ({ market, columnId, children }: BorrowRateTooltipProps) => {
  const { title, type } = borrowRateTooltipConfig[columnId]
  return (
    <Tooltip
      clickable
      title={title}
      body={<MarketBorrowRateTooltipWrapper market={market} borrowRateType={type} />}
      placement="top"
    >
      {children}
    </Tooltip>
  )
}
