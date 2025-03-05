import { useMemo } from 'react'
import type { AppPage } from './types'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { APP_LINK, AppName, externalAppUrl } from '@ui-kit/shared/routes'
import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'

export type PageTabsProps = {
  pages: AppPage[]
  currentApp: AppName
  selectedApp: AppName
  networkName: string
}

export const PageTabs = ({ pages, currentApp, selectedApp, networkName }: PageTabsProps) => (
  <TabsSwitcher
    value={currentApp == selectedApp ? pages.find((page) => page.isActive)?.route : undefined}
    options={useMemo(
      () =>
        currentApp == selectedApp
          ? pages.map((page) => ({
              label: page.label,
              value: page.route,
              component: page.target ? Link : RouterLink,
              ...(page.target ? { href: page.route, target: page.target } : { to: page.route }),
            }))
          : APP_LINK[selectedApp].pages.map(({ label, route }) => ({
              label: label(),
              value: route,
              href: externalAppUrl(route, networkName, selectedApp),
            })),
      [currentApp, networkName, pages, selectedApp],
    )}
    variant="overlined"
    muiVariant="standard"
    sx={{ overflow: 'visible' }}
  />
)
