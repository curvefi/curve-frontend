import Stack from '@mui/material/Stack'
import { UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TokenIcon } from '@ui/components/TokenIcon'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import type { VaultActivityRow } from '../types'
import { getVaultEventChange } from '../utils'

const EXPANDED_METRIC_CATEGORY = 'llamalend.marketParticipantsExpanded'

export const VaultActivityExpandedPanel: ExpandedPanelComponent<VaultActivityRow> = ({ row: { original: event } }) => {
  const { amounts, valueColor } = getVaultEventChange(event)
  return (
    <Stack>
      {amounts && (
        <MetricsGrid variant="mobileRows">
          <Metric
            category={EXPANDED_METRIC_CATEGORY}
            label={notFalsy(t`Assets`, event.borrowToken?.symbol && `(${event.borrowToken.symbol})`).join(' ')}
            value={amounts.assets}
            valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION, color: valueColor }}
            icon={
              event.borrowToken && (
                <TokenIcon blockchainId={event.blockchainId} address={event.borrowToken.address} size="mui-sm" />
              )
            }
          />
          <Metric
            category={EXPANDED_METRIC_CATEGORY}
            label={notFalsy(t`Shares`, event.vaultToken?.symbol && `(${event.vaultToken.symbol})`).join(' ')}
            value={amounts.shares}
            valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION, color: valueColor }}
            icon={
              event.vaultToken && (
                <TokenIcon blockchainId={event.blockchainId} address={event.vaultToken.address} size="mui-sm" />
              )
            }
          />
        </MetricsGrid>
      )}
      <ActionInfo label={t`User`} value={shortenString(event.provider)} size="small" />
    </Stack>
  )
}
