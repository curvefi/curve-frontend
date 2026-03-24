import type { CallExceptionError } from 'ethers'
import { type IconButtonProps } from '@mui/material/IconButton'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'

export const ErrorIconButton = ({
  error,
  message,
  size,
}: {
  message?: string | false | null
  error: Error | string | boolean
  size: IconButtonProps['size']
}) => (
  <CopyIconButton
    copyText={message || error.toString()}
    label={`${(error as Error).message || (error as CallExceptionError).reason || error.toString() || 'Unknown error'} (${t`Click to copy error to clipboard`})`}
    confirmationText={t`Error copied to clipboard`}
    size={size}
    data-error={error.toString()}
  >
    <ExclamationTriangleIcon color="error" />
  </CopyIconButton>
)
