import { MarketNetBorrowAprTooltipContentProps } from '@/llamalend/widgets/tooltips/MarketNetBorrowAprTooltipContent'
import { t } from '@ui-kit/lib/i18n'

/** Tooltip title for borrow APR. The title should be "Net borrow APR" if there are extra rewards or rebasing yield, otherwise "Borrow APR". */
export const useBorrowRateTooltipTitle = ({
  totalBorrowApr,
  extraRewards,
  rebasingYieldApr,
}: Pick<MarketNetBorrowAprTooltipContentProps, 'totalBorrowApr' | 'extraRewards' | 'rebasingYieldApr'>) =>
  totalBorrowApr != null && (extraRewards.length || rebasingYieldApr != null) ? t`Net borrow APR` : t`Borrow APR`
