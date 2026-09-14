import { type IconButtonProps } from '@mui/material/IconButton'
import { notFalsy } from '@primitives/objects.utils'
import { CopyIconButton } from '@ui/components/CopyIconButton'
import { ExclamationTriangleIcon } from '@ui/icons/ExclamationTriangleIcon'
import { t } from '@ui/lib/i18n'

const getShortMessage = (error: Error | string | boolean) =>
  (error as Error).message || (error as { reason?: string }).reason || error.toString() || 'Unknown error'

export const ErrorIconButton = ({
  error,
  size,
}: {
  error: Error | string | boolean
  size: IconButtonProps['size']
}) => (
  <CopyIconButton
    copyText={notFalsy(getShortMessage(error), error.toString(), (error as Error)?.stack).join('\n')}
    label={`${getShortMessage(error)} (${t`Click to copy error to clipboard`})`}
    confirmationText={t`Error copied to clipboard`}
    size={size}
    data-error={error.toString()}
  >
    <ExclamationTriangleIcon color="error" />
  </CopyIconButton>
)
