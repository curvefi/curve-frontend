import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, type Amount } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const formatAmount = (amount: Amount | undefined) =>
  amount == null ? '-' : formatNumber(amount, { abbreviate: false })

export const ClaimTokenCell = ({
  amount,
  symbol,
  token,
  blockchainId,
}: {
  amount: Amount | undefined
  symbol?: string
  token: string
  blockchainId: string
}) => (
  <InlineTableCell>
    <Stack direction="row" gap={Spacing.xs} alignItems="center">
      <TokenIcon blockchainId={blockchainId} address={token} tooltip={symbol} size="lg" />
      <Stack gap={Spacing.xxs} alignItems="flex-start">
        <Typography variant="tableCellL">{formatAmount(amount)}</Typography>
        <Stack direction="row" gap={Spacing.xs} alignItems="center">
          <ChainIcon blockchainId={blockchainId} size="sm" />
          <Typography variant="tableCellSRegular" color="textSecondary">
            {symbol}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </InlineTableCell>
)
