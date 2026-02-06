import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenChainIcon } from '@ui-kit/shared/ui/TokenChainIcon'
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
      <Box
        sx={{
          position: 'relative', // to position the chain icon on top of the token icon
        }}
      >
        <TokenIcon blockchainId={blockchainId} address={token} tooltip={symbol} size="lg" />
        <TokenChainIcon chain={blockchainId} />
      </Box>
      <Stack gap={Spacing.xxs} alignItems="flex-start">
        <Typography variant="tableCellL">{formatAmount(amount)}</Typography>
        <Stack direction="row" gap={Spacing.xs} alignItems="center">
          <Typography variant="tableCellSRegular" color="textSecondary">
            {symbol}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </InlineTableCell>
)
