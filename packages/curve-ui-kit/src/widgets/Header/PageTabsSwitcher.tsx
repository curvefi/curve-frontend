import { useMemo } from 'react'
import MuiLink from '@mui/material/Link'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { TabsSwitcher, TabsSwitcherProps } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import type { AppPage } from './types'

export type PageTabsProps = {
  pages: AppPage[]
  overflow?: TabsSwitcherProps<string>['overflow']
}

export const PageTabsSwitcher = ({ pages, overflow = 'standard' }: PageTabsProps) => (
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
    variant="underlined"
    overflow={overflow}
    hideInactiveBorders
    sx={{ overflow: 'visible' }}
  />
)
