import type { FunctionComponent } from 'react'
import { ListItem } from '@mui/material'
import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { RouterLink } from 'curve-ui-kit/src/shared/ui/RouterLink'
import type { AppPage } from 'ui/src/AppNav/types'
import Link from '@mui/material/Link'

type SidebarItemProps = {
  page: AppPage;
  child?: boolean
}

export const SidebarItem: FunctionComponent<SidebarItemProps> = ({ page, child }) => (
  <ListItem
    disableGutters
    sx={{ display: 'flex', marginBottom: 1, paddingY: 0, paddingRight: 2, paddingLeft: child ? 4 : 0 }}
  >
    <Button
      component={page.route.startsWith("http") ? Link : RouterLink}
      target={page.route.startsWith("http") ? "_blank" : undefined}
      href={page.route}
      variant="ghost"
      color={child ? 'inherit' : 'secondary'}
      sx={{ justifyContent: 'flex-start' }}
    >
      {page.label}
    </Button>
  </ListItem>
)
