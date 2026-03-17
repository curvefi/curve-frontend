import type { Theme } from '@mui/material'
import { type IconButtonProps } from '@mui/material/IconButton'
import type { SystemStyleObject } from '@mui/system'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'

export const ErrorIconButton = ({
  error,
  message,
  buttonSize,
  iconSx,
}: {
  message?: string | false | null
  error: Error | string | boolean
  buttonSize: IconButtonProps['size']
  iconSx: SystemStyleObject<Theme>
}) => (
  <CopyIconButton
    copyText={message || error.toString()}
    label={t`Copy error to clipboard`}
    confirmationText={t`Error copied to clipboard`}
    size={buttonSize}
  >
    {/* we need 3 & here because the IconButton overrides the size quite specifically per viewport */}
    <ExclamationTriangleIcon sx={{ '&&&': iconSx }} color="error" />
  </CopyIconButton>
)
