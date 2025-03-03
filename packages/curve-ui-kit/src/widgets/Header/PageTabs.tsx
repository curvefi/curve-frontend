import { useMemo } from 'react'
import type { AppPage } from './types'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { APP_LINK, AppName } from '@ui-kit/shared/routes'
import Link from '@mui/material/Link'
import RouterLink from 'next/link'

export type PageTabsProps = {
  pages: AppPage[]
  currentApp: AppName
  selectedApp: AppName
  networkName: string
}

export const PageTabs = ({ pages, currentApp, selectedApp }: PageTabsProps) => (
  <TabsSwitcher
    value={currentApp == selectedApp ? pages.find((page) => page.isActive)?.route : undefined}
    options={useMemo(
      () =>
        pages.map(({ label, route, target }) => ({
          label,
          value: route,
          component: target ? Link : RouterLink,
          href: `${APP_LINK[selectedApp].root}/${route}`,
          target,
        })),
      [pages, selectedApp],
    )}
    variant="overlined"
    muiVariant="standard"
    sx={{ overflow: 'visible' }}
  />
)
