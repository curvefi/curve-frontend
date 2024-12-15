import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'
import { ReactNode } from 'react'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
  target?: string
}

export const Link = ({ label, href, icon, target = '_blank' }: LinkProps) => (
  <Button
    component={href.startsWith('http') ? LinkMui : RouterLink}
    to={href}
    href={href}
    target={target}
    rel="noreferrer"
    color="ghost"
    variant="link"
    startIcon={icon}
  >
    {label}
  </Button>
)
