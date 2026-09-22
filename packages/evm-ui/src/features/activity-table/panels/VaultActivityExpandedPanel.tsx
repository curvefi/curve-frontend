import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { LlammaTokenAmount } from '../cells'
import type { VaultActivityRow } from '../types'
import { getVaultEventChange } from '../utils'

export const VaultActivityExpandedPanel: ExpandedPanelComponent<VaultActivityRow> = ({ row: { original: event } }) => {
  const { amounts, sign } = getVaultEventChange(event)
  return (
    <Stack>
      {amounts && (
        <>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="bodyMRegular" color="textSecondary">{t`Assets`}</Typography>
            <LlammaTokenAmount
              amount={sign * amounts.assets}
              blockchainId={event.blockchainId}
              token={event.borrowToken}
            />
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="bodyMRegular" color="textSecondary">{t`Shares`}</Typography>
            <LlammaTokenAmount
              amount={sign * amounts.shares}
              blockchainId={event.blockchainId}
              token={event.vaultToken}
            />
          </Stack>
        </>
      )}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
        <Typography variant="tableCellMBold">{shortenString(event.provider)}</Typography>
      </Stack>
    </Stack>
  )
}
