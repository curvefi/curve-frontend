import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReleaseChannelToggleButtons } from '@ui-kit/features/user-profile/settings/ReleaseChannelToggleButtons'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ThemeToggleButtons } from './ThemeToggleButtons'

const { ButtonSize, Spacing } = SizesAndSpaces

export const Settings = () => (
  <Stack gap={Spacing.xs} paddingBlock={{ ...Spacing.md, desktop: 0 }} data-testid="user-profile-settings">
    <SettingsOption label={t`Theme`}>
      <ThemeToggleButtons />
    </SettingsOption>

    <SettingsOption label={t`Release Channel`}>
      <ReleaseChannelToggleButtons />
    </SettingsOption>
  </Stack>
)

const SettingsOption = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack
    height={ButtonSize.sm}
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    marginInline={{ ...Spacing.sm, desktop: 0 }}
    gap={{ desktop: Spacing.sm.desktop }}
  >
    <Typography variant="bodyMBold" color={useIsDesktop() ? 'text.secondary' : 'navigation'}>
      {label}
    </Typography>
    <Stack alignItems="center" justifyContent="center">
      {children}
    </Stack>
  </Stack>
)
