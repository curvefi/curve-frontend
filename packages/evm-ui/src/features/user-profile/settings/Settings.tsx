import type { ReactNode } from 'react'
import { ReleaseChannelToggleButtons } from '@evm-ui/features/user-profile/settings/ReleaseChannelToggleButtons'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { ShowDeprecatedMarketsToggle } from './ShowDeprecatedMarketsToggle'
import { ThemeToggleButtons } from './ThemeToggleButtons'

const { ButtonSize, Spacing } = SizesAndSpaces

export const Settings = () => (
  <Stack data-testid="user-profile-settings" sx={{ gap: Spacing.xs, paddingBlock: { ...Spacing.md, desktop: 0 } }}>
    <SettingsOption label={t`Theme`}>
      <ThemeToggleButtons />
    </SettingsOption>

    <SettingsOption label={t`Release Channel`}>
      <ReleaseChannelToggleButtons />
    </SettingsOption>

    <SettingsOption label={t`Show deprecated markets`}>
      <ShowDeprecatedMarketsToggle />
    </SettingsOption>
  </Stack>
)

const SettingsOption = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack
    direction="row"
    sx={{
      height: ButtonSize.sm,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginInline: { ...Spacing.sm, desktop: 0 },
      gap: { desktop: Spacing.sm.desktop },
    }}
  >
    <Typography variant="bodyMBold" color={useIsDesktop() ? 'text.secondary' : 'navigation'}>
      {label}
    </Typography>
    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>{children}</Stack>
  </Stack>
)
