import RouterLink from 'next/link'
import { ReactNode } from 'react'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import type { AppName } from '@ui-kit/shared/routes'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
  target?: string
  networkId: string
  appName: AppName
}

export const Link = ({ label, href, icon, target = '_blank', appName, networkId }: LinkProps) => (
  <Button
    {...(href.startsWith('http')
      ? { component: LinkMui, href, target, rel: 'noreferrer' }
      : { component: RouterLink, href: `/${appName}/${networkId}/${href}` })}
    color="ghost"
    variant="link"
    startIcon={icon}
  >
    {label}
  </Button>
)
