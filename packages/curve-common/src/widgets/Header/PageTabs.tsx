import { FunctionComponent } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import type { AppPage } from './types'
import Button from '@mui/material/Button'
import { TabsSwitcher } from 'curve-ui-kit/src/shared/ui/TabsSwitcher'

export type PageTabsProps = {
  pages: AppPage[]
}

export const PageTabs: FunctionComponent<PageTabsProps> = ({ pages }) => (
  <TabsSwitcher
    value={pages.find(page => page.isActive)?.route}
    options={pages.map(page => ({ label: page.label, value: page.route, href: page.route }))}
    variant="overlined"
    textVariant="headingXsBold"
  />
)
