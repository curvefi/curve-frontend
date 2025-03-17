import type { ReactNode } from 'react'
import { List, ListSubheader } from '@mui/material'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import type { AppPage } from '@ui-kit/widgets/Header/types'
import { SidebarItem } from './SidebarItem'

interface SidebarSectionProps {
  title: string
  pages?: AppPage[]
  children?: ReactNode
}

export const SidebarSection = ({ pages, title, children }: SidebarSectionProps) => (
  <List
    subheader={
      <ListSubheader disableSticky sx={{ padding: 0 }}>
        <Typography variant="headingSBold" color="text.primary" sx={{ paddingX: 4, paddingTop: 4, paddingBottom: 2 }}>
          {title}
        </Typography>
        <Divider />
      </ListSubheader>
    }
    sx={{ marginTop: 3 }}
  >
    {pages?.map((page) => <SidebarItem child key={page.href} page={page} />)}
    {children}
  </List>
)
