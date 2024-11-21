import type { FunctionComponent } from 'react'
import { ListItem } from '@mui/material'
import type { AppPage } from 'curve-common/src/widgets/Header/types'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'

type SidebarItemProps = {
  page: AppPage
  child?: boolean
}

export const SidebarItem: FunctionComponent<SidebarItemProps> = ({ page, child }) => (
  <ListItem disableGutters sx={{ display: 'flex', marginY: 3, paddingY: 0, paddingRight: 2, paddingLeft: child ? 4 : 0 }}>
    <Button
      component={Link}
      target={page.route.startsWith('http') ? '_blank' : undefined}
      href={page.route}
      className={page.isActive ? 'current' : ''}
      color="navigation"
      size="small"
      data-testid={`sidebar-item-${page.label.toLowerCase()}`}
      sx={{ justifyContent: 'flex-start', textDecoration: 'none', textTransform: 'uppercase' }}
      variant="ghost"
    >
      {page.label}
    </Button>
  </ListItem>
)
