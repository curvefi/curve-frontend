import RouterLink from 'next/link'
import { useMemo } from 'react'
import Link from '@mui/material/Link'
import { getInternalUrl } from '@ui-kit/shared/routes'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import type { AppRoute } from './types'

export type PageTabsProps = {
  pages: AppRoute[]
  currentRoute: string | undefined | null
  networkName: string
}

export const PageTabs = ({ pages, currentRoute, networkName }: PageTabsProps) => (
  <TabsSwitcher
    value={currentRoute ?? undefined}
    options={useMemo(
      () =>
        pages.map(({ app, label, route, target }) => ({
          label: label(),
          value: route,
          component: target ? Link : RouterLink,
          href: target ? route : getInternalUrl(app, networkName, route),
          target,
        })),
      [networkName, pages],
    )}
    variant="overlined"
    muiVariant="standard"
    sx={{ overflow: 'visible' }}
  />
)
