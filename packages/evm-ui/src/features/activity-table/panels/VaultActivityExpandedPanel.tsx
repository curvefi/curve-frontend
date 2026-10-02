import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import type { VaultActivityRow } from '../types'
import { getVaultEventChange } from '../utils'

export const VaultActivityExpandedPanel: ExpandedPanelComponent<VaultActivityRow> = ({ row: { original: event } }) => {
  const { amounts, valueColor } = getVaultEventChange(event)
  return (
    <Stack>
      {amounts && (
        <MetricsGrid variant="mobileRows">
          <MetricExpandedPanel
            label={notFalsy(t`Assets`, event.borrowToken?.symbol && `(${event.borrowToken.symbol})`).join(' ')}
            value={amounts.assets}
            valueOptions={{ color: valueColor }}
            icon={{ blockchainId: event.blockchainId, token: event.borrowToken }}
          />
          <MetricExpandedPanel
            label={notFalsy(t`Shares`, event.vaultToken?.symbol && `(${event.vaultToken.symbol})`).join(' ')}
            value={amounts.shares}
            valueOptions={{ color: valueColor }}
            icon={{ blockchainId: event.blockchainId, token: event.vaultToken }}
          />
        </MetricsGrid>
      )}
      <ActionInfo label={t`User`} value={shortenString(event.provider)} />
    </Stack>
  )
}
