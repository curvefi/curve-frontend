import { completeArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybes } from '@primitives/objects.utils'
import { useFormContext } from '@ui/features/forms'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { getBalancedAmounts, getLimitingBalanceIndex } from '../balanced-amounts.utils'
import { poolAmountField, type PoolForm, poolMaxAmountField } from '../pool-form.utils'

/** Creates an object with the amounts that should be updated in the form, when selecting the balanced deposit checkbox */
const getBalancedUpdates = (isConnected: boolean, reserves: Decimal[], decimals: number[], amounts: Decimal[]) => {
  const index = isConnected
    ? getLimitingBalanceIndex(reserves, decimals, amounts)
    : amounts.findIndex(amount => +amount) // use the index of the first positive input when disconnected
  if (index < 0) return {} // No positive input yet: enable linked editing without filling amounts.
  const balanced = getBalancedAmounts(reserves, decimals, amounts[index], index)
  return fromEntries(balanced.map((amount, index) => [poolAmountField(index), amount]))
}

export const BalancedDepositCheckbox = ({
  reserves: { data: reserves },
  isConnected,
  disabled,
}: {
  reserves: QueryProp<Decimal[]>
  isConnected: boolean
  disabled: boolean
}) => {
  const { watchValues, update } = useFormContext<PoolForm>()
  const values = watchValues()
  const decimals = completeArray(values.decimals)
  const maxAmounts = completeArray(reserves?.map((_, index) => values[poolMaxAmountField(index)]))
  const enteredAmounts = reserves?.map((_, index) => values[poolAmountField(index)] ?? '0') // used when disconnected
  return (
    <CheckboxField
      label={t`Add all coins in a balanced proportion`}
      checked={values.isBalanced}
      disabled={disabled || reserves == null || decimals == null}
      testIdPrefix="pool-deposit-balanced"
      onChange={event => {
        if (!event.target.checked) return update({ isBalanced: false })
        update({
          isBalanced: true,
          ...maybes([reserves, decimals, maxAmounts ?? enteredAmounts], (reserves, decimals, amounts) =>
            getBalancedUpdates(isConnected, reserves, decimals, amounts),
          ),
        })
      }}
    />
  )
}
