import type { AppLinks } from '@evm-ui/widgets/Header/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { recordEntries } from '@primitives/objects.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

type AppNavAppsProps<TApp extends string, TMenuApp extends TApp> = {
  currentMenu: TMenuApp
  blockchainId: string
  links: AppLinks<TApp, TMenuApp>
  urlFactory: (app: TApp, blockchainId: string, route?: string) => string
}

const { Spacing } = SizesAndSpaces

export const AppButtonLinks = <TApp extends string, TMenuApp extends TApp>({
  currentMenu,
  blockchainId,
  links,
  urlFactory,
}: AppNavAppsProps<TApp, TMenuApp>) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginInline: Spacing.md }}>
    {recordEntries(links).map(([menu, { label, routes }]) => (
      <Button
        key={menu}
        color="navigation"
        size="small"
        className={currentMenu === menu ? 'current' : ''}
        component={RouterLink}
        href={urlFactory(routes[0].app, blockchainId)}
        data-testid={`app-link-${menu}`}
      >
        {label}
      </Button>
    ))}
  </Box>
)
