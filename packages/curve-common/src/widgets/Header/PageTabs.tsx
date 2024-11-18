import { FunctionComponent } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import type { AppPage } from './types'
import Button from '@mui/material/Button'

export type PageTabsProps = {
  pages: AppPage[]
}

export const PageTabs: FunctionComponent<PageTabsProps> = ({ pages }) => (
  <Tabs value={pages.find(page => page.isActive)?.route ?? false}>
    {pages.map((page) => (
      <Tab
        key={page.label}
        label={<Button variant="ghost" color="navigation">{page.label}</Button>}
        href={page.route}
        value={page.route}
      />
    ))}
  </Tabs>
)
