import Stack from '@mui/material/Stack'
import { shortenString } from '@primitives/string.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
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
          <ActionInfo
            label={t`Assets`}
            value={
              <LlammaTokenAmount
                amount={sign * amounts.assets}
                blockchainId={event.blockchainId}
                token={event.borrowToken}
              />
            }
          />
          <ActionInfo
            label={t`Shares`}
            value={
              <LlammaTokenAmount
                amount={sign * amounts.shares}
                blockchainId={event.blockchainId}
                token={event.vaultToken}
              />
            }
          />
        </>
      )}
      <ActionInfo label={t`User`} value={shortenString(event.provider)} />
    </Stack>
  )
}
