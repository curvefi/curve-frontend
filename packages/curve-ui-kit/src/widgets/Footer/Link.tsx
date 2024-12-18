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
    {...(href.startsWith('http')
      ? { component: LinkMui, href, target, rel: 'noreferrer' }
      : { component: RouterLink, to: href })}
    color="ghost"
    variant="link"
    startIcon={icon}
  >
    {label}
  </Button>
)
