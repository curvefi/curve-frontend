import { useFormContext } from '@ui/features/forms'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { t } from '@ui/lib/i18n'
import type { PoolDepositForm } from '../pool-form.utils'

export const WrappedDepositCheckbox = ({ disabled }: { disabled: boolean }) => {
  const { watchValue, update } = useFormContext<PoolDepositForm>()
  const isWrapped = watchValue('isWrapped')
  return (
    <CheckboxField
      label={t`Deposit Wrapped`}
      checked={isWrapped}
      disabled={disabled}
      testIdPrefix="pool-deposit-wrapped"
      onChange={({ target: { checked } }) => update({ isWrapped: checked, isBalanced: false })}
    />
  )
}
