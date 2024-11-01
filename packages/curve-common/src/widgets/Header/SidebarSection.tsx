import type { FunctionComponent, ReactNode } from 'react'
import { List, ListSubheader } from '@mui/material'
import { SidebarItem } from './SidebarItem'
import type { AppPage } from 'ui/src/AppNav/types'
import Divider from '@mui/material/Divider'

interface SidebarSectionProps {
  title: string
  pages?: AppPage[]
  currentPath: string
  children?: ReactNode
}

export const SidebarSection: FunctionComponent<SidebarSectionProps> = ({ pages, title, currentPath, children }) => (
  <List
    subheader={
      <ListSubheader sx={{ textTransform: 'uppercase' }} disableSticky>
        {title}
        <Divider />
      </ListSubheader>
    }
    sx={{ marginTop: 2 }}
  >
    {pages?.map((page) => <SidebarItem child key={page.route} page={page} currentPath={currentPath} />)}
    {children}
  </List>
)
