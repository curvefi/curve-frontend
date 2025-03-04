import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import RouterLink from 'next/link'
import { ReactNode } from 'react'
import type { AppName } from '@ui-kit/shared/routes'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
  target?: string
  networkName: string
  appName: AppName
}

export const Link = ({ label, href, icon, target = '_blank', appName, networkName }: LinkProps) => (
  <Button
    {...(href.startsWith('http')
      ? { component: LinkMui, href, target, rel: 'noreferrer' }
      : { component: RouterLink, href: `/${appName}/${networkName}/${href}` })}
    color="ghost"
    variant="link"
    startIcon={icon}
  >
    {label}
  </Button>
)
