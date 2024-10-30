import { FunctionComponent } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import type { AppPage } from 'ui/src/AppNav/types'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

export type PageTabsProps = {
  pages: AppPage[]
}

export const PageTabs: FunctionComponent<PageTabsProps> = ({ pages }) => (
  <Tabs value={pages.find(page => page.isActive)?.route ?? false}>
    {pages.map((page) => (
      <Tab
        key={page.label}
        label={<Typography variant="headingXsBold" sx={{ textTransform: 'uppercase' }}>{page.label}</Typography>}
        href={page.route}
        value={page.route}
      />
    ))}
  </Tabs>
)
