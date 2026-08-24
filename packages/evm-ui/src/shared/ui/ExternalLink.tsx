import type { ReactNode } from 'react'
import { ArrowTopRightIcon } from '@evm-ui/shared/icons/ArrowTopRightIcon'
import { applySxProps } from '@evm-ui/utils'
import Button, { type ButtonOwnProps } from '@mui/material/Button'

export const ExternalLink = ({
  href,
  label,
  wide,
  ...buttonProps
}: {
  href: string
  label: ReactNode
  /** Puts start icon on the left with the label, and end icon all the way to the right */
  wide?: boolean
} & ButtonOwnProps) => (
  <Button
    variant="link"
    color="ghost"
    href={href}
    target="_blank"
    rel="noreferrer"
    endIcon={<ArrowTopRightIcon />}
    {...buttonProps}
    sx={applySxProps(
      buttonProps.sx,
      wide && { justifyContent: 'start', '& .MuiButton-endIcon': { marginLeft: 'auto' } },
    )}
  >
    {label}
  </Button>
)
