import { BaseHeaderProps } from './types'
import Box, {type BoxProps} from '@mui/material/Box'
import { LanguageSwitcher } from '../../features/switch-language'
import { ThemeSwitcherButtons } from '../../features/switch-theme'
import { ConnectWalletIndicator } from '../../features/connect-wallet'
import type { SxProps, Theme } from '@mui/system'
import SettingsIcon from '@mui/icons-material/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import { AdvancedModeSwitcher } from '../../features/switch-advanced-mode'

type SideBarFooterProps = Pick<
  BaseHeaderProps,
  'translations' | 'advancedMode' | 'LanguageProps' | 'themes' | 'WalletProps'
> & {
  sx: SxProps<Theme>
}

const backgroundColor = 'background.paper'

export const SideBarFooter = ({
  themes: [theme, setTheme],
  advancedMode: [isAdvancedMode, setAdvancedMode],
  LanguageProps,
  WalletProps,
  translations: t,
  sx,
}: SideBarFooterProps) => (
  <>
    <Box position="fixed" bottom={0} sx={{ ...sx, backgroundColor }}>
      <Box display="flex" paddingX={4} marginTop={4}>
        <ConnectWalletIndicator {...WalletProps} sx={{ flexGrow: 1 }} />
      </Box>

      {/* todo: Update all paper borders and colors in theme */}
      <Accordion sx={{ borderRadius: '0 !important', backgroundColor }} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor }}>
          <SettingsIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />
          <Typography
            sx={{ marginLeft: 1, verticalAlign: 'top' }}
            variant="bodyMBold"
            color="navigation"
            data-testid="sidebar-settings"
          >
            {t.settings}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ backgroundColor, borderTop: (t: Theme) => `1px solid ${t.palette.text.secondary}`, paddingBottom: 4 }}
        >
          <SettingsOption label={t.theme}>
            <ThemeSwitcherButtons theme={theme} onChange={setTheme} label={t.theme} />
          </SettingsOption>
          {/* extra margin to make it similar to the mode switcher */}
          <SettingsOption label={t.language} marginBottom={3}>
            <LanguageSwitcher {...LanguageProps} />
          </SettingsOption>
          <SettingsOption label={t.advancedMode}>
            <AdvancedModeSwitcher advancedMode={isAdvancedMode} onChange={setAdvancedMode} />
          </SettingsOption>
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
