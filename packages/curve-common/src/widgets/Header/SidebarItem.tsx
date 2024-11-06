import type { FunctionComponent } from 'react'
import { ListItem } from '@mui/material'
import { RouterLink } from 'curve-ui-kit/src/shared/ui/RouterLink'
import type { AppPage } from 'ui/src/AppNav/types'
import Link from '@mui/material/Link'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

type SidebarItemProps = {
  page: AppPage;
  child?: boolean
}

export const SidebarItem: FunctionComponent<SidebarItemProps> = ({ page, child }) => {
  const Component = page.route.startsWith('http') ? Link : RouterLink
  return (
    <ListItem
      disableGutters
      sx={{ display: 'flex', marginY: 3, paddingY: 0, paddingRight: 2, paddingLeft: child ? 4 : 0 }}
    >
      <Component
        target={page.route.startsWith('http') ? '_blank' : undefined}
        href={page.route}
        sx={{ justifyContent: 'flex-start', textDecoration: 'none' }}
      >
        <Typography variant="bodyMBold" color={child ? 'text.secondary' : 'text.primary'} sx={{ textTransform: 'uppercase' }}>
          {page.label}
        </Typography>
      </Component>
    </ListItem>
  )
}
