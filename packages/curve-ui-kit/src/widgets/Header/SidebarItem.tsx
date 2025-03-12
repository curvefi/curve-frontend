import RouterLink from 'next/link'
import { ListItem } from '@mui/material'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import type { AppPage } from '@ui-kit/widgets/Header/types'

type SidebarItemProps = {
  page: AppPage
  child?: boolean
}

export const SidebarItem = ({ page, child }: SidebarItemProps) => (
  <ListItem disableGutters sx={{ display: 'flex', paddingY: 0, paddingRight: 4, paddingLeft: child ? 4 : 0 }}>
    <Button
      {...(page.route.startsWith('http')
        ? { component: Link, href: page.route, target: page.target }
        : { component: RouterLink, href: page.route, className: page.isActive ? 'current' : '' })}
      color="navigation"
      size="small"
      data-testid={`sidebar-item-${page.label.toLowerCase()}`}
      sx={{ justifyContent: 'flex-start', textDecoration: 'none', textTransform: 'uppercase', width: '100%' }}
    >
      {page.label}
    </Button>
  </ListItem>
)
