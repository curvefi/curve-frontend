import { BaseHeaderProps } from './types'
import Box, { type BoxProps } from '@mui/material/Box'
import { ThemeSwitcherButtons } from 'curve-ui-kit/src/features/switch-theme'
import { ConnectWalletIndicator } from 'curve-ui-kit/src/features/connect-wallet'
import type { SxProps, Theme } from '@mui/system'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { AdvancedModeSwitcher } from 'curve-ui-kit/src/features/switch-advanced-mode'
import { t } from '@lingui/macro'
import { GearIcon } from 'curve-ui-kit/src/shared/icons/GearIcon'

type SideBarFooterProps = Pick<BaseHeaderProps, 'advancedMode' | 'themes' | 'WalletProps'> & {
  sx: SxProps<Theme>
}

const backgroundColor = 'background.paper'

export const SideBarFooter = ({ themes: [theme, setTheme], advancedMode, WalletProps, sx }: SideBarFooterProps) => (
  <>
    <Box position="fixed" bottom={0} sx={{ ...sx, backgroundColor }}>
      <Box display="flex" paddingX={4} marginTop={4}>
        <ConnectWalletIndicator {...WalletProps} sx={{ flexGrow: 1 }} />
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
          {advancedMode && (
            <SettingsOption label={t`Advanced Mode`}>
              <AdvancedModeSwitcher advancedMode={advancedMode} />
            </SettingsOption>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
    <Box minHeight={150} /> {/* To avoid the last item to be hidden by the connect indicator */}
  </>
)

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
