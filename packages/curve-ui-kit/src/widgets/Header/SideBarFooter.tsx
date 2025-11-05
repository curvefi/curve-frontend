import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { Settings } from '@ui-kit/features/user-profile/settings/Settings'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { MOBILE_SIDEBAR_WIDTH } from '@ui-kit/themes/components'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

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
        <Settings />
      </AccordionDetails>
    </Accordion>
  </Stack>
)
