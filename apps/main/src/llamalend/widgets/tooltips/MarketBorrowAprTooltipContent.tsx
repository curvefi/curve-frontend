import { BORROW_APR_DESCRIPTION } from '@/llamalend/features/market-list/header-tooltips/constants'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'

export type MarketBorrowAprTooltipContentProps = {
  borrowRate: number | null | undefined
  averageRate: number | null | undefined
  periodLabel: string // e.g. "7D", "30D"
  isLoading?: boolean
  marketType: LlamaMarketType
}

export const MarketBorrowAprTooltipContent = ({
  borrowRate,
  averageRate,
  periodLabel,
  isLoading,
  marketType,
}: MarketBorrowAprTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription text={t`The borrow APR is the annual interest rate you pay on your borrowed amount.`} />
    <TooltipDescription text={BORROW_APR_DESCRIPTION[marketType]} />

    <TooltipItems secondary>
      <TooltipItem title={t`Borrow APR`}>{formatPercent(borrowRate ?? 0)}</TooltipItem>
      <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
        {averageRate == null ? 'N/A' : formatPercent(averageRate)}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
