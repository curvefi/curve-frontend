import type { UseFormReturn } from '@ui/features/forms'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { t } from '@ui/lib/i18n'
import type { PoolDepositForm } from '../pool-form.utils'

export const WrappedDepositCheckbox = ({
  form: {
    values: { isWrapped },
    update,
  },
  disabled,
}: {
  form: Pick<UseFormReturn<PoolDepositForm>, 'values' | 'update'>
  disabled: boolean
}) => (
  <CheckboxField
    label={t`Deposit Wrapped`}
    checked={isWrapped}
    disabled={disabled}
    testIdPrefix="pool-deposit-wrapped"
    onChange={({ target: { checked } }) => update({ isWrapped: checked, isBalanced: false })}
  />
)
