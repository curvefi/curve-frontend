import type { UseFormReturn } from '@ui/features/forms'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { t } from '@ui/lib/i18n'

export const WrappedWithdrawCheckbox = ({
  form: {
    values: { isWrapped },
    update,
  },
  disabled,
}: {
  form: Pick<UseFormReturn<{ isWrapped?: boolean }>, 'values' | 'update'>
  disabled: boolean
}) => (
  <CheckboxField
    label={t`Withdraw Wrapped`}
    checked={!!isWrapped}
    disabled={disabled}
    testIdPrefix="pool-withdraw-wrapped"
    onChange={({ target: { checked } }) => update({ isWrapped: checked })}
  />
)
