import { t } from '@evm-ui/lib/i18n'
import type { ExpandedPanelComponent } from '@evm-ui/shared/ui/DataTable/ExpansionRow'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { formatToken } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import type { PoolTradeRow } from '../types'

const { Spacing } = SizesAndSpaces

export const PoolTradesExpandedPanel: ExpandedPanelComponent<PoolTradeRow> = ({
  row: {
    original: { tokensSold, tokenSold, buyer, blockchainId },
  },
}) => (
  <Stack>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`Sold`}</Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
        <Typography variant="tableCellMBold" color="error">
          -{formatToken(tokensSold, tokenSold.symbol, 'amount')}
        </Typography>
        <TokenIcon blockchainId={blockchainId} address={tokenSold.address} size="mui-sm" />
      </Stack>
    </Stack>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
      <Typography variant="tableCellMBold">{shortenString(buyer)}</Typography>
    </Stack>
  </Stack>
)
