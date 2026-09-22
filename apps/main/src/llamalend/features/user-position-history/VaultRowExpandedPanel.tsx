import Stack from '@mui/material/Stack'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { VaultChangeAmount } from './cells/VaultChangeAmount'
import type { ParsedUserVaultEvent } from './hooks/useUserVaultEvents'

export const VaultRowExpandedPanel: ExpandedPanelComponent<ParsedUserVaultEvent> = ({ row: { original: event } }) => (
  <Stack>
    <ActionInfo label={t`Amount`} value={<VaultChangeAmount value={event.amount} symbol={event.symbol} />} />
    <ActionInfo label={t`Shares`} value={<VaultChangeAmount value={event.shareChange} />} />
  </Stack>
)
