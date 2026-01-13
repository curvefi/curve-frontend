import { Item } from '@/lend/components/AlertLoanSummary/components/Item'
import type { SummaryProps } from '@/lend/components/AlertLoanSummary/types'
import { format } from '@/lend/components/AlertLoanSummary/utils'
import { t } from '@ui-kit/lib/i18n'

export const SummaryCreate = ({
  title,
  pendingMessage,
  receive = '',
  formValueStateDebt = '',
  collateralSymbol,
  borrowedSymbol,
}: SummaryProps) => (
  <>
    <strong>{pendingMessage}</strong>

    {title}

    <Item label={t`Debt:`} value={`${format(formValueStateDebt)} ${borrowedSymbol}`} />
    <Item label={t`Collateral:`} value={`${format(receive)} ${collateralSymbol}`} />
  </>
)
