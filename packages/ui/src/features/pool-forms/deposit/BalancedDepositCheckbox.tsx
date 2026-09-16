import { completeArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybes } from '@primitives/objects.utils'
import { useFormContext } from '@ui/features/forms'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { getBalancedAmounts, getBalancedWalletAmounts } from '../balanced-amounts.utils'
import { poolAmountField, type PoolForm, poolMaxAmountField } from '../pool-form.utils'

function getDisconnectedBalancedAmounts(reserves: Decimal[], decimals: number[], amounts: Decimal[]) {
  const index = amounts.findIndex(amount => +amount) // note: purposefully -1 when all amounts are zero
  return getBalancedAmounts(reserves, decimals, amounts[index], index)
}

/** Creates an object with the amounts that should be updated in the form, when selecting the balanced deposit checkbox */
const getBalancedUpdates = (reserves: Decimal[], decimals: number[], amounts: Decimal[], isConnected: boolean) =>
  fromEntries(
    (isConnected
      ? getBalancedWalletAmounts(reserves, decimals, amounts)
      : getDisconnectedBalancedAmounts(reserves, decimals, amounts)
    ).map((amount, index) => [poolAmountField(index), amount]),
  )

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
  const amounts = isConnected ? maxAmounts : reserves?.map((_, index) => values[poolAmountField(index)] ?? '0')
  return (
    <CheckboxField
      label={t`Add all coins in a balanced proportion`}
      checked={values.isBalanced}
      disabled={disabled || reserves == null || decimals == null || amounts == null}
      testIdPrefix="pool-deposit-balanced"
      onChange={({ target: { checked } }) =>
        update({
          isBalanced: checked,
          ...(checked &&
            maybes([reserves, decimals, amounts], (reserves, decimals, amounts) =>
              getBalancedUpdates(reserves, decimals, amounts, isConnected),
            )),
        })
      }
    />
  )
}
