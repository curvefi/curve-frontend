import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import type { PoolLiquidityRow } from '../types'

export const PoolLiquidityExpandedPanel: ExpandedPanelComponent<PoolLiquidityRow> = ({
  row: {
    original: { tokenAmounts, poolTokens, provider, blockchainId, eventType },
  },
}) => {
  const isAdd = eventType === 'AddLiquidity'

  // Filter out zero amounts
  const nonZeroAmounts = tokenAmounts
    .map((amount, index) => ({ amount, index, token: poolTokens[index] }))
    .filter(({ amount }) => amount !== 0)

  return (
    <Stack>
      <MetricsGrid variant="mobileRows">
        {nonZeroAmounts.map(({ amount, index, token }) => (
          <MetricExpandedPanel
            key={token?.address ?? index}
            label={notFalsy(t`Amount`, `(${token?.symbol ?? t`Token ${index + 1}`})`).join(' ')}
            value={isAdd ? amount : -amount}
            valueOptions={{ color: isAdd ? 'success' : 'error' }}
            icon={{ blockchainId, token }}
          />
        ))}
      </MetricsGrid>
      <ActionInfo label={t`User`} value={shortenString(provider)} />
    </Stack>
  )
}
