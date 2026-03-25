import type { CallExceptionError } from 'ethers'
import { type IconButtonProps } from '@mui/material/IconButton'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'

const getShortMessage = (error: Error | string | boolean) =>
  (error as Error).message || (error as CallExceptionError).reason || error.toString() || 'Unknown error'

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
