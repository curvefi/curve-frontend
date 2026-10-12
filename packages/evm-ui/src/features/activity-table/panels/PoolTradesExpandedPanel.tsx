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
import type { PoolTradeRow } from '../types'
import { formatActivityUsdValue } from '../utils'

export const PoolTradesExpandedPanel: ExpandedPanelComponent<PoolTradeRow> = ({
  row: {
    original: { tokensSold, tokensSoldUsd, tokenSold, buyer, blockchainId, time },
  },
}) => {
  const currentDate = useCurrentDate()

  return (
    <Stack>
      <MetricsGrid variant="mobileRows">
        <MetricExpandedPanel
          label={notFalsy(t`Sold`, tokenSold.symbol && `(${tokenSold.symbol})`).join(' ')}
          value={-tokensSold}
          valueOptions={{ color: 'error' }}
          notional={constQ(
            formatActivityUsdValue(
              { amount: tokensSold, amountUsd: tokensSoldUsd, timestamp: time, isSold: true },
              currentDate,
            ),
          )}
          icon={{ blockchainId, token: tokenSold }}
        />
      </MetricsGrid>
      <ActionInfo label={t`User`} value={shortenString(buyer)} />
    </Stack>
  )
}
