import { useMemo } from 'react'
import type { AppRoute } from './types'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { APP_LINK, AppName } from '@ui-kit/shared/routes'
import Link from '@mui/material/Link'
import RouterLink from 'next/link'

export type PageTabsProps = {
  pages: AppRoute[]
  currentRoute: string | undefined | null
  selectedApp: AppName
  networkName: string
}

export const PageTabs = ({ pages, currentRoute, networkName, selectedApp }: PageTabsProps) => (
  <TabsSwitcher
    value={currentRoute ?? undefined}
    options={useMemo(
      () =>
        pages.map(({ label, route, target }) => ({
          label: label(),
          value: route,
          component: target ? Link : RouterLink,
          href: `${APP_LINK[selectedApp].root}/${networkName}${route}`,
          target,
        })),
      [networkName, pages, selectedApp],
    )}
    variant="overlined"
    muiVariant="standard"
    sx={{ overflow: 'visible' }}
  />
)
