import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TokenIcon } from '@ui/components/TokenIcon'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import type { MarketTradeRow } from '../types'

const EXPANDED_METRIC_CATEGORY = 'llamalend.marketParticipantsExpanded'

export const MarketTradesExpandedPanel: ExpandedPanelComponent<MarketTradeRow> = ({
  row: {
    original: { amountSold, tokenSold, buyer, blockchainId },
  },
}) => (
  <Stack>
    <MetricsGrid variant="mobileRows">
      <Metric
        category={EXPANDED_METRIC_CATEGORY}
        label={notFalsy(t`Sold`, tokenSold.symbol && `(${tokenSold.symbol})`).join(' ')}
        value={amountSold}
        valueOptions={{ abbreviate: false, fallback: '-', color: 'error' }}
        icon={<TokenIcon blockchainId={blockchainId} address={tokenSold.address} size="mui-sm" />}
      />
    </MetricsGrid>
    <ActionInfo label={t`User`} value={shortenString(buyer)} size="small" />
  </Stack>
)
