import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'

export const ErrorIconButton = ({
  error,
  message,
}: {
  message?: string | false | null
  error: Error | string | boolean
}) => (
  <CopyIconButton
    copyText={message || error.toString()}
    label={t`Copy error to clipboard`}
    confirmationText={t`Error copied to clipboard`}
  >
    <ExclamationTriangleIcon fontSize="small" color="error" />
  </CopyIconButton>
)
