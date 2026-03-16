import { type IconButtonProps } from '@mui/material/IconButton'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import type { SxProps } from '@ui-kit/utils'

export const ErrorIconButton = ({
  error,
  message,
  buttonSize,
  iconSx,
}: {
  message?: string | false | null
  error: Error | string | boolean
  buttonSize: IconButtonProps['size']
  iconSx: SxProps
}) => (
  <CopyIconButton
    copyText={message || error.toString()}
    label={t`Copy error to clipboard`}
    confirmationText={t`Error copied to clipboard`}
    size={buttonSize}
    data-error={error.toString()}
  >
    <ExclamationTriangleIcon sx={iconSx} color="error" />
  </CopyIconButton>
)
