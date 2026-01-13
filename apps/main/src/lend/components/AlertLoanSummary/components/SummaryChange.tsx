import { Item } from '@/lend/components/AlertLoanSummary/components/Item'
import type { SummaryProps } from '@/lend/components/AlertLoanSummary/types'
import { format } from '@/lend/components/AlertLoanSummary/utils'
import { Icon } from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'

export const SummaryChange = ({
  title,
  pendingMessage,
  borrowedSymbol,
  collateralSymbol,
  receive = '0',
  formValueStateDebt = '0',
  userState,
}: SummaryProps) => {
  const { debt: stateDebt = '0', collateral: stateCollateral = '0' } = userState ?? {}

  const newDebt = +stateDebt + +formValueStateDebt
  const showDebt = +stateDebt !== newDebt

  const newStateCollateral = +stateCollateral + +receive
  const showCollateral = +stateCollateral !== newStateCollateral

  return (
    <>
      <strong>{pendingMessage}</strong>

      {title}

      <Item
        label={t`Debt:`}
        value={
          <>
            {showDebt && (
              <>
                {format(stateDebt)} <Icon size={16} name="ArrowRight" />
              </>
            )}{' '}
            {format(newDebt)} {borrowedSymbol}
          </>
        }
      />
      <Item
        label={t`Collateral:`}
        value={
          <>
            {showCollateral && (
              <>
                {format(stateCollateral)} <Icon size={16} name="ArrowRight" />
              </>
            )}
            {format(newStateCollateral)} {collateralSymbol}
          </>
        }
      />
    </>
  )
}
