import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { VaultChangeAmount } from './cells/VaultChangeAmount'
import type { ParsedUserVaultEvent } from './hooks/useUserVaultEvents'

export const VaultRowExpandedPanel: ExpandedPanelComponent<ParsedUserVaultEvent> = ({ row: { original: event } }) => (
  <Stack>
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`Amount`}</Typography>
      <VaultChangeAmount value={event.amount} symbol={event.symbol} />
    </Stack>
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`Shares`}</Typography>
      <VaultChangeAmount value={event.shareChange} />
    </Stack>
  </Stack>
)
