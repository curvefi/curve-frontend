import { BaseHeaderProps, toolbarColors } from './types'
import Box from '@mui/material/Box'
import { LanguageSwitcher } from '../../features/switch-language'
import { ThemeSwitcherButton } from '../../features/switch-theme'
import { ConnectWalletIndicator } from '../../features/connect-wallet'
import type { SxProps, Theme } from '@mui/system'
import SettingsIcon from '@mui/icons-material/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'
import { CSSProperties } from '@mui/material/styles/createTypography'

type SideBarFooterProps = Pick<BaseHeaderProps, 'translations' | 'LanguageProps' | 'themes' | 'WalletProps'> & {
  sx: SxProps<Theme>
}

const backgroundColor =  (t: Theme) => toolbarColors[t.palette.mode][0]
const fontSize = (t: Theme) => (t.typography as Record<string, CSSProperties>)['bodyXsBold'].fontSize

export const SideBarFooter = ({
  themes: [theme, setTheme],
  LanguageProps,
  WalletProps,
  translations: t,
  sx
}: SideBarFooterProps) => (
  <>
    <Box position="fixed" bottom={0}
         sx={{ ...sx, zIndex: 1300, backgroundColor }}>
      <Box display="flex" paddingX={4}>
        <ConnectWalletIndicator {...WalletProps} sx={{ flexGrow: 1 }} />
      </Box>

      {/*todo: update all paper borders and colors in theme */}
      <Accordion sx={{ border: '0 !important', backgroundColor }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ border: 0, backgroundColor }}>
          <SettingsIcon sx={{ fontSize }} />
          <Typography sx={{ marginLeft: 1 }} variant="bodyXsBold">
            {t.settings}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor }}>
          <Box display="flex" flexDirection="column" marginLeft={2} justifyContent="flex-end" gap={3} flexGrow={1}>
            <LanguageSwitcher {...LanguageProps} />
            <ThemeSwitcherButton theme={theme} onChange={setTheme} label={t.themeSwitcher} />
          </Box>
        </AccordionDetails>
      </Accordion>

    </Box>
    <Box minHeight={40} /> {/* To avoid the last item to be hidden by the connect indicator */}
  </>
)
