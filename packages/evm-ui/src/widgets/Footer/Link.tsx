import { ReactNode } from 'react'
import type { AppName } from '@evm-ui/shared/routes'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
  target?: string
  blockchainId: string
  appName: AppName
}

export const Link = ({ label, href, icon, target = '_blank', appName, blockchainId }: LinkProps) => (
  <Button
    {...(href.startsWith('http')
      ? { component: LinkMui, href, target, rel: 'noreferrer' }
      : { component: RouterLink, href: `/${appName}/${blockchainId}/${href}` })}
    color="ghost"
    variant="link"
    startIcon={icon}
  >
    {label}
  </Button>
)
