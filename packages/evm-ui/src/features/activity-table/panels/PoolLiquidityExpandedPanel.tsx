import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import type { PoolLiquidityRow } from '../types'
import { getChangeColor, getPoolLiquidityEventTokenDeltas } from '../utils'

export const PoolLiquidityExpandedPanel: ExpandedPanelComponent<PoolLiquidityRow> = ({ row: { original: event } }) => (
  <Stack>
    <MetricsGrid variant="mobileRows">
      {getPoolLiquidityEventTokenDeltas(event).map(delta => (
        <MetricExpandedPanel
          key={delta.label}
          label={notFalsy(t`Amount`, `(${delta.token?.symbol ?? delta.label})`).join(' ')}
          value={delta.amount}
          valueOptions={{ color: getChangeColor(delta.amount, 'success', 'error') }}
          icon={{ blockchainId: delta.blockchainId, token: delta.token }}
        />
      ))}
    </MetricsGrid>
    <ActionInfo label={t`User`} value={shortenString(event.provider)} />
  </Stack>
)
