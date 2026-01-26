import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { t } from '@ui-kit/lib/i18n'
import { formatPercent } from '@ui-kit/utils'

export type MarketBorrowAprTooltipContentProps = {
  borrowRate: number | null | undefined
  averageRate: number | null | undefined
  periodLabel: string // e.g. "7D", "30D"
  isLoading?: boolean
}

export const MarketBorrowAprTooltipContent = ({
  borrowRate,
  averageRate,
  periodLabel,
  isLoading,
}: MarketBorrowAprTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription text={t`The borrow APR is the annual interest rate you pay on your borrowed amount.`} />

    <TooltipItems secondary>
      <TooltipItem title={t`Borrow APR`}>{formatPercent(borrowRate ?? 0)}</TooltipItem>
      <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
        {averageRate == null ? 'N/A' : formatPercent(averageRate)}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
