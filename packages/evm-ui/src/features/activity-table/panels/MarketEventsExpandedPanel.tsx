import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow } from '../types'
import { formatTokenDeltaUsd, getChangeColor, getLlammaEventTokenDeltas } from '../utils'

export const MarketEventsExpandedPanel: ExpandedPanelComponent<MarketEventRow> = ({ row: { original: event } }) => {
  const currentDate = useCurrentDate()

  return (
    <Stack>
      <MetricsGrid variant="mobileRows">
        {getLlammaEventTokenDeltas(event).map(delta => (
          <MetricExpandedPanel
            key={delta.label}
            label={notFalsy(delta.label, delta.token?.symbol && `(${delta.token.symbol})`).join(' ')}
            value={Math.abs(delta.amount)}
            valueOptions={{ color: getChangeColor(delta.amount, 'success', 'error') }}
            notional={constQ(formatTokenDeltaUsd({ ...delta, amount: Math.abs(delta.amount) }, currentDate))}
            icon={{ blockchainId: delta.blockchainId, token: delta.token }}
          />
        ))}
      </MetricsGrid>
      <ActionInfo label={t`User`} value={shortenString(event.provider)} />
    </Stack>
  )
}
