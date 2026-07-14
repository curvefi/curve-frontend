import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { shortenString } from '@primitives/string.utils'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { LlammaTradeRow } from '../types'

const { Spacing } = SizesAndSpaces

export const LlammaTradesExpandedPanel: ExpandedPanelComponent<LlammaTradeRow> = ({
  row: {
    original: { amountSold, tokenSold, buyer, network },
  },
}) => (
  <Stack>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`Sold`}</Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
        <Typography variant="tableCellMBold" color="error">
          {formatNumber(amountSold, { abbreviate: false })} {tokenSold.symbol}
        </Typography>
        <TokenIcon blockchainId={network} address={tokenSold.address} size="mui-sm" />
      </Stack>
    </Stack>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
      <Typography variant="tableCellMBold">{shortenString(buyer)}</Typography>
    </Stack>
  </Stack>
)
