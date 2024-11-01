import type { FunctionComponent } from 'react'
import { ListItem } from '@mui/material'
import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { RouterLink } from 'curve-ui-kit/src/shared/ui/RouterLink'
import type { AppPage } from 'ui/src/AppNav/types'

type SidebarItemProps = {
  page: AppPage;
  currentPath: string;
  depth?: number
}

export const SidebarItem: FunctionComponent<SidebarItemProps> = ({ page, currentPath, depth = 0 }) => {
  console.log(page.label, depth)
  return (
    <ListItem
      disableGutters
      sx={{ display: 'flex', marginBottom: 0.5, paddingY: 0, paddingRight: 2, paddingLeft: depth * 4 }}
    >
      <Button
        component={RouterLink}
        href={page.route}
        variant="ghost"
        color={depth ? 'inherit' : 'secondary'}
      >
        {page.label}
      </Button>
    </ListItem>
  )
}
