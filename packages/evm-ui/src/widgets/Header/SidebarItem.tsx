import type { AppPage } from '@evm-ui/widgets/Header/types'
import { ListItem } from '@mui/material'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { RouterLink } from '@ui/components/RouterLink'

type SidebarItemProps = {
  page: AppPage
  child?: boolean
}

export const SidebarItem = ({ page, child }: SidebarItemProps) => (
  <ListItem disableGutters sx={{ display: 'flex', paddingY: 0, paddingRight: 4, paddingLeft: child ? 4 : 0 }}>
    <Button
      {...(page.href.startsWith('http')
        ? { component: Link, href: page.href, target: page.target }
        : { component: RouterLink, href: page.href, className: page.isActive ? 'current' : '' })}
      color="navigation"
      size="small"
      data-testid={`sidebar-item-${page.label.toLowerCase()}`}
      sx={{ justifyContent: 'flex-start', textDecoration: 'none', textTransform: 'uppercase', width: '100%' }}
    >
      {page.label}
    </Button>
  </ListItem>
)
