import type { AppLinks } from '@evm-ui/widgets/Header/types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { recordEntries } from '@primitives/objects.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

type AppNavAppsProps<TMenuApp extends string> = {
  currentMenu: TMenuApp
  links: AppLinks<TMenuApp>
}

const { Spacing } = SizesAndSpaces

export const AppButtonLinks = <TMenuApp extends string>({ currentMenu, links }: AppNavAppsProps<TMenuApp>) => (
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
