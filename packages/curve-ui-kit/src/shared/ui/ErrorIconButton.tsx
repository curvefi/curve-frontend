import { IconButtonProps } from '@mui/material/IconButton'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'

export const ErrorIconButton = ({
  error,
  message,
  buttonSize,
  iconSize,
}: {
  message?: string | false | null
  error: Error | string | boolean
  buttonSize: IconButtonProps['size']
  iconSize: SvgIconProps['fontSize']
}) => (
  <CopyIconButton
    copyText={message || error.toString()}
    label={t`Copy error to clipboard`}
    confirmationText={t`Error copied to clipboard`}
    size={buttonSize}
  >
    <ExclamationTriangleIcon fontSize={iconSize} color="error" />
  </CopyIconButton>
)
