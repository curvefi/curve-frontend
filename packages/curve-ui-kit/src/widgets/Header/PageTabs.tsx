import { FunctionComponent, useMemo } from 'react'
import type { AppPage } from './types'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { APP_LINK, AppName, externalAppUrl } from '@ui-kit/shared/routes'
import { Link as RouterLink } from 'react-router-dom'

export type PageTabsProps = {
  pages: AppPage[]
  currentApp: AppName
  selectedApp: AppName
  networkName: string
}

export const PageTabs: FunctionComponent<PageTabsProps> = ({ pages, currentApp, selectedApp, networkName }) => (
  <TabsSwitcher
    value={currentApp == selectedApp ? pages.find((page) => page.isActive)?.route : undefined}
    options={useMemo(
      () =>
        currentApp == selectedApp
          ? pages.map((page) => ({
              label: page.label,
              value: page.route,
              to: page.route,
              component: RouterLink,
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
