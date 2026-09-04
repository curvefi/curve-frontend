import { type ReactNode } from 'react'
import { useCopyToClipboard } from '@evm-ui/hooks/useCopyToClipboard'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { CopyIcon } from '@ui/icons/CopyIcon'

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
