import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, type Amount } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const formatBalance = (balance: Amount | undefined) =>
  balance == null ? '-' : formatNumber(balance, { abbreviate: false })

export const TokenBalanceCell = ({
  balance,
  symbol,
  token,
  blockchainId,
}: {
  balance: Amount | undefined
  symbol?: string
  token: string
  blockchainId: string | undefined
}) => (
  <InlineTableCell>
    <Stack direction="row" gap={Spacing.xs} alignItems="center">
      <TokenIcon blockchainId={blockchainId} address={token} tooltip={symbol} size="lg" showChainIcon />
      <Stack gap={Spacing.xxs} alignItems="flex-start">
        <Typography variant="tableCellL">{formatBalance(balance)}</Typography>
        <Typography variant="tableCellSRegular" color="textSecondary">
          {symbol}
        </Typography>
      </Stack>
    </Stack>
  </InlineTableCell>
)
