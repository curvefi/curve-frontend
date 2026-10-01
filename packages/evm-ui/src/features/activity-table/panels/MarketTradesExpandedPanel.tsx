import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import type { MarketTradeRow } from '../types'

export const MarketTradesExpandedPanel: ExpandedPanelComponent<MarketTradeRow> = ({
  row: {
    original: { amountSold, tokenSold, buyer, blockchainId },
  },
}) => (
  <Stack>
    <MetricsGrid variant="mobileRows">
      <MetricExpandedPanel
        label={notFalsy(t`Sold`, tokenSold.symbol && `(${tokenSold.symbol})`).join(' ')}
        value={amountSold}
        valueOptions={{ color: 'error' }}
        icon={{ blockchainId, token: tokenSold }}
      />
    </MetricsGrid>
    <ActionInfo label={t`User`} value={shortenString(buyer)} size="small" />
  </Stack>
)
