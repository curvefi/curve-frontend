import { BaseHeaderProps } from './types'
import Box, { type BoxProps } from '@mui/material/Box'
import { ThemeSwitcherButtons } from 'curve-ui-kit/src/features/switch-theme'
import { ConnectWalletIndicator } from 'curve-ui-kit/src/features/connect-wallet'
import type { Theme } from '@mui/material/styles'
import { UserProfileButton, useUserProfileStore } from 'curve-ui-kit/src/features/user-profile'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { AdvancedModeSwitcher } from 'curve-ui-kit/src/features/switch-advanced-mode'
import { t } from '@lingui/macro'
import { GearIcon } from 'curve-ui-kit/src/shared/icons/GearIcon'
import { MOBILE_SIDEBAR_WIDTH } from 'curve-ui-kit/src/themes/components'

type SideBarFooterProps = Pick<BaseHeaderProps, 'WalletProps'>

const backgroundColor = 'background.paper'

export const SideBarFooter = ({ WalletProps }: SideBarFooterProps) => {
  const theme = useUserProfileStore((state) => state.theme)
  const setTheme = useUserProfileStore((state) => state.setTheme)
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const setAdvancedMode = useUserProfileStore((state) => state.setAdvancedMode)

  return (
    <>
      <Box
        position="fixed"
        bottom={0}
        sx={(t) => ({
          ...MOBILE_SIDEBAR_WIDTH,
          zIndex: t.zIndex.drawer + 1,
          backgroundColor,
        })}
      >
        <Box display="flex" paddingX={4} marginTop={4}>
          <ConnectWalletIndicator {...WalletProps} sx={{ flexGrow: 1 }} />
          <UserProfileButton />
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
          <AccordionDetails
            sx={{ backgroundColor, borderTop: (t: Theme) => `1px solid ${t.palette.text.secondary}`, paddingBottom: 4 }}
          >
            <SettingsOption label={t`Mode`}>
              <ThemeSwitcherButtons theme={theme} onChange={setTheme} label={t`Mode`} />
            </SettingsOption>
            (
            <SettingsOption label={t`Advanced Mode`}>
              <AdvancedModeSwitcher advancedMode={[isAdvancedMode, setAdvancedMode]} />
            </SettingsOption>
            )
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box minHeight={150} /> {/* To avoid the last item to be hidden by the connect indicator */}
    </>
  )
}

const SettingsOption = ({ label, children, ...props }: BoxProps & { label: string }) => (
  <Box display="flex" flexDirection="row" justifyContent="space-between" {...props}>
    <Typography variant="bodyMBold" color="navigation" marginLeft={2} sx={{ display: 'flex', alignItems: 'center' }}>
      {label}
    </Typography>
    <Box display="flex" alignItems="center">
      {children}
    </Box>
  </Box>
)
