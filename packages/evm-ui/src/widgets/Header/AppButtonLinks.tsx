import type { HeaderAppLinks } from '@evm-ui/widgets/Header/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { recordEntries } from '@primitives/objects.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

type AppNavAppsProps<TApp extends string> = {
  currentMenu: TApp
  links: HeaderAppLinks<TApp>
}

const { Spacing } = SizesAndSpaces

export const AppButtonLinks = <TApp extends string>({ currentMenu, links }: AppNavAppsProps<TApp>) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginInline: Spacing.md }}>
    {recordEntries(links).map(([menu, { label, href }]) => (
      <Button
        key={menu}
        color="navigation"
        size="small"
        className={currentMenu === menu ? 'current' : ''}
        component={RouterLink}
        href={href}
        data-testid={`app-link-${menu}`}
      >
        {label}
      </Button>
    ))}
  </Box>
)
