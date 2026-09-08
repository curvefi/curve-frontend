import { useMemo } from 'react'
import MuiLink from '@mui/material/Link'
import { RouterLink } from '@ui/components/RouterLink'
import { TabsSwitcher, TabsSwitcherProps } from '@ui/components/Tabs/TabsSwitcher'
import type { HeaderLink } from './types'

type PageTabsProps = {
  pages: HeaderLink[]
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
