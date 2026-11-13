import { useFormContext } from '@ui/features/forms'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { t } from '@ui/lib/i18n'

export const WrappedWithdrawCheckbox = ({ disabled }: { disabled: boolean }) => {
  const {
    values: { isWrapped },
    update,
  } = useFormContext<{ isWrapped: boolean }>()
  return (
    <CheckboxField
      label={t`Withdraw Wrapped`}
      checked={isWrapped}
      disabled={disabled}
      testIdPrefix="pool-withdraw-wrapped"
      onChange={({ target: { checked } }) => update({ isWrapped: checked })}
    />
  )
}
