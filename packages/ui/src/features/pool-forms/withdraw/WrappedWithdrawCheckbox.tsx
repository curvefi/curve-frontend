import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { t } from '@ui/lib/i18n'

export const WrappedWithdrawCheckbox = ({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled: boolean
  onChange: (isWrapped: boolean) => void
}) => (
  <CheckboxField
    label={t`Withdraw Wrapped`}
    checked={checked}
    disabled={disabled}
    testIdPrefix="pool-withdraw-wrapped"
    onChange={({ target: { checked } }) => onChange(checked)}
  />
)
