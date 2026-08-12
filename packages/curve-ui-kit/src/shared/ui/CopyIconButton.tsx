import { type ReactNode } from 'react'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import { useCopyToClipboard } from '@ui-kit/hooks/useCopyToClipboard'
import { CopyIcon } from '@ui-kit/shared/icons/CopyIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

type CopyIconButtonProps = {
  copyText: string | undefined
  label: string
  confirmationText: string
  confirmationMessage?: string
  children?: ReactNode
} & IconButtonProps

export const CopyIconButton = ({
  copyText,
  label,
  confirmationText,
  confirmationMessage,
  children = <CopyIcon />,
  size = 'extraSmall',
  ...iconProps
}: CopyIconButtonProps) => (
  <Tooltip title={label} placement="top">
    <IconButton
      size={size}
      {...iconProps}
      onClick={useCopyToClipboard({ copyText, confirmationText, confirmationMessage })}
    >
      {children}
    </IconButton>
  </Tooltip>
)
