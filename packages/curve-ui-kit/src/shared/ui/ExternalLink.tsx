import Button, { type ButtonOwnProps } from '@mui/material/Button'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { applySxProps } from '@ui-kit/utils'

export const ExternalLink = ({
  href,
  label,
  wide,
  ...buttonProps
}: {
  href: string
  label: string
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
