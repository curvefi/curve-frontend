import Button, { type ButtonOwnProps } from '@mui/material/Button'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'

export const ExternalLink = ({
  href,
  label,
  ...buttonProps
}: {
  href: string
  label: string
} & ButtonOwnProps) => (
  <Button
    variant="link"
    color="ghost"
    href={href}
    target="_blank"
    rel="noreferrer"
    endIcon={<ArrowTopRightIcon />}
    {...buttonProps}
  >
    {label}
  </Button>
)
