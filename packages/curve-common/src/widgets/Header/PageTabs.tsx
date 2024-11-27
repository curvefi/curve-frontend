import { FunctionComponent, useMemo } from 'react'
import type { AppPage } from './types'
import { TabsSwitcher } from 'curve-ui-kit/src/shared/ui/TabsSwitcher'
import { APP_LINK, AppName, createAppUrl } from 'curve-ui-kit/src/shared/routes'

export type PageTabsProps = {
  pages: AppPage[]
  currentApp: AppName
  selectedApp: AppName
}

export const PageTabs: FunctionComponent<PageTabsProps> = ({ pages, currentApp, selectedApp }) => (
  <TabsSwitcher
    value={currentApp == selectedApp ? pages.find((page) => page.isActive)?.route : undefined}
    options={useMemo(() =>
      currentApp == selectedApp
        ? pages.map((page) => ({ label: page.label, value: page.route, href: page.route }))
        : APP_LINK[selectedApp].pages.map((page) => ({
            label: page.label,
            value: page.route,
            href: createAppUrl(selectedApp, page),
          })),
      [currentApp, pages, selectedApp])
    }
    variant="overlined"
    textVariant="headingXsBold"
  />
)
