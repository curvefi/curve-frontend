import type { FunctionComponent } from 'react'
import { ListItem } from '@mui/material'
import type { AppPage } from '@ui-kit/widgets/Header/types'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'

type SidebarItemProps = {
  page: AppPage
  child?: boolean
}

export const SidebarItem: FunctionComponent<SidebarItemProps> = ({ page, child }) => (
  <ListItem disableGutters sx={{ display: 'flex', paddingY: 0, paddingRight: 4, paddingLeft: child ? 4 : 0 }}>
    <Button
      {...(page.route.startsWith('http')
        ? { component: Link, href: page.route, target: page.target }
        : { component: RouterLink, to: page.route, className: page.isActive ? 'current' : '' })}
      color="navigation"
      size="small"
      data-testid={`sidebar-item-${page.label.toLowerCase()}`}
      sx={{ justifyContent: 'flex-start', textDecoration: 'none', textTransform: 'uppercase', width: '100%' }}
    >
      {page.label}
    </Button>
  </ListItem>
)
