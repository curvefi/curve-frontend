import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, shortenString } from '@ui-kit/utils'
import type { PoolTradeRow } from '../types'

const { Spacing } = SizesAndSpaces

export const PoolTradesExpandedPanel: ExpandedPanel<PoolTradeRow> = ({
  row: {
    original: { txUrl, tokensSold, tokenSold, buyer, network },
  },
}) => (
  <Stack>
    <Stack paddingTop={Spacing.md} gap={Spacing.xs}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="bodyMRegular" color="textSecondary">{t`Sold`}</Typography>
        <Stack direction="row" alignItems="center" gap={Spacing.xs}>
          <Typography variant="tableCellMBold" color="error">
            -{formatNumber(tokensSold, { abbreviate: false })} {tokenSold.symbol}
          </Typography>
          <TokenIcon blockchainId={network} address={tokenSold.address} size="mui-sm" />
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="bodyMRegular" color="textSecondary">{t`User`}</Typography>
        <Typography variant="tableCellMBold">{shortenString(buyer)}</Typography>
      </Stack>
    </Stack>

    {txUrl && <ExternalLink href={txUrl} label={t`View Transaction`} size="extraSmall" />}
  </Stack>
)
