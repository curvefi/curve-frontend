import RouterLink from 'next/link'
import { useMemo } from 'react'
import MuiLink from '@mui/material/Link'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import type { AppPage } from './types'

export type PageTabsProps = {
  pages: AppPage[]
}

export const PageTabs = ({ pages }: PageTabsProps) => (
  <TabsSwitcher
    value={useMemo(() => pages.find(({ isActive }) => isActive)?.href, [pages])}
    options={useMemo(
      () =>
        pages.map(({ label, href, target }) => ({
          label,
          component: href.startsWith('http') ? MuiLink : RouterLink,
          value: href,
          href,
          target,
        })),
      [pages],
    )}
    variant="overlined"
    muiVariant="standard"
    sx={{ overflow: 'visible' }}
  />
)
