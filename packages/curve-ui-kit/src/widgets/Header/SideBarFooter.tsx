import type { ReactNode } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { AdvancedModeSwitch } from '@ui-kit/features/user-profile/settings/AdvancedModeSwitch'
import { ReleaseChannelToggleButtons } from '@ui-kit/features/user-profile/settings/ReleaseChannelToggleButtons'
import { ThemeToggleButtons } from '@ui-kit/features/user-profile/settings/ThemeToggleButtons'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { MOBILE_SIDEBAR_WIDTH } from '@ui-kit/themes/components'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces

const backgroundColor = 'background.paper'
const footerMargin = Spacing.lg.mobile
const connectButtonHeight = ButtonSize.sm
const accordionHeight = ButtonSize.md
const footerHeight = `${footerMargin} + ${accordionHeight} + ${connectButtonHeight}`

/**
 * Calculates the height needed to prevent content from being hidden behind the fixed footer.
 * Otherwise, the `SocialSidebarSection` is hidden by `ConnectWalletIndicator` & `AccordionSummary`.
 *
 * Since the drawer takes 100vh, we need to account for the header height as well.
 */
const useFillerHeight = () => `calc(${useLayoutStore((state) => state.navHeight)}px + ${footerHeight})`

export const SideBarFooter = ({ onConnect }: { onConnect: () => void }) => (
  <>
    <Box
      position="fixed"
      bottom={0}
      sx={(t) => ({ ...MOBILE_SIDEBAR_WIDTH, zIndex: t.zIndex.drawer + 1, backgroundColor })}
    >
      <Box display="flex" paddingX={4} marginTop={4}>
        <ConnectWalletIndicator sx={{ flexGrow: 1 }} onConnect={onConnect} />
      </Box>

      <Accordion sx={{ backgroundColor }} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor, paddingInline: 4 }}>
          <GearIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />
          <Typography
            sx={{ marginLeft: 1, alignContent: 'center' }}
            variant="bodyMBold"
            color="navigation"
            data-testid="sidebar-settings"
          >
            {t`Settings`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor, borderTop: (t: Theme) => `1px solid ${t.palette.text.secondary}` }}>
          <Stack gap={Spacing.xs}>
            <SettingsOption label={t`Theme`}>
              <ThemeToggleButtons size="small" compact />
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
    </Box>
    <Box minHeight={useFillerHeight()} />
  </>
)

const SettingsOption = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack height={ButtonSize.sm} direction="row" justifyContent="space-between" alignItems="center" marginInline={2}>
    <Typography variant="bodyMBold" color="navigation">
      {label}
    </Typography>
    <Stack alignItems="center" justifyContent="center">
      {children}
    </Stack>
  </Stack>
)
