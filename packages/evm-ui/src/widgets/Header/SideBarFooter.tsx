import { ConnectWalletIndicator } from '@evm-ui/features/connect-wallet'
import { Settings } from '@evm-ui/features/user-profile/settings/Settings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// eslint-disable-next-line no-restricted-imports
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { MOBILE_SIDEBAR_WIDTH } from '@ui/features/themes/components'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { GearIcon } from '@ui/icons/GearIcon'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

const BACKGROUND_COLOR = 'background.paper'

export const SideBarFooter = ({ onConnect }: { onConnect: () => void }) => (
  <Stack sx={{ ...MOBILE_SIDEBAR_WIDTH, backgroundColor: BACKGROUND_COLOR }}>
    <ConnectWalletIndicator sx={{ flexGrow: 1, margin: Spacing.sm }} onConnect={onConnect} />

    <Accordion sx={{ backgroundColor: BACKGROUND_COLOR }} disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: BACKGROUND_COLOR, paddingInline: Spacing.sm }}
      >
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
      <AccordionDetails
        sx={{ backgroundColor: BACKGROUND_COLOR, borderTop: (t: Theme) => `1px solid ${t.palette.text.secondary}` }}
      >
        <Settings />
      </AccordionDetails>
    </Accordion>
  </Stack>
)
