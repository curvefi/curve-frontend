import type { ReactNode } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { AdvancedModeSwitch } from '@ui-kit/features/user-profile/settings/AdvancedModeSwitch'
import { ReleaseChannelToggleButtons } from '@ui-kit/features/user-profile/settings/ReleaseChannelToggleButtons'
import { ThemeToggleButtons } from '@ui-kit/features/user-profile/settings/ThemeToggleButtons'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { MOBILE_SIDEBAR_WIDTH } from '@ui-kit/themes/components'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces

const backgroundColor = 'background.paper'

export const SideBarFooter = ({ onConnect }: { onConnect: () => void }) => (
  <Stack sx={{ ...MOBILE_SIDEBAR_WIDTH, backgroundColor }}>
    <ConnectWalletIndicator sx={{ flexGrow: 1, margin: Spacing.sm }} onConnect={onConnect} />

    <Accordion sx={{ backgroundColor }} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor, paddingInline: Spacing.sm }}>
        <GearIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />
        <Typography
          sx={{ marginLeft: Spacing.sm, alignContent: 'center' }}
          variant="bodyMBold"
          color="navigation"
          data-testid="sidebar-settings"
        >
          {t`Settings`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor, borderTop: (t: Theme) => `1px solid ${t.palette.text.secondary}` }}>
        <Stack gap={Spacing.xs} paddingBlock={Spacing.md}>
          <SettingsOption label={t`Theme`}>
            <ThemeToggleButtons />
          </SettingsOption>

          <SettingsOption label={t`Mode`}>
            <ReleaseChannelToggleButtons />
          </SettingsOption>

          <SettingsOption label={t`Advanced Mode`}>
            <AdvancedModeSwitch />
          </SettingsOption>
        </Stack>
      </AccordionDetails>
    </Accordion>
  </Stack>
)

const SettingsOption = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack
    height={ButtonSize.sm}
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    marginInline={Spacing.sm}
  >
    <Typography variant="bodyMBold" color="navigation">
      {label}
    </Typography>
    <Stack alignItems="center" justifyContent="center">
      {children}
    </Stack>
  </Stack>
)
