import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { type TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, type Amount } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const formatBalance = (balance: Amount | undefined) =>
  balance == null ? '-' : formatNumber(balance, { abbreviate: false })

type TokenBalanceCellData = {
  symbol?: string
  token: string
}

export const TokenBalanceCell = <TRow extends TableItem>({ row, getValue, table }: CellContext<TRow, Amount>) => {
  const { symbol, token } = row.original as TRow & TokenBalanceCellData
  return (
    <InlineTableCell>
      <Stack direction="row" gap={Spacing.xs} alignItems="center">
        <TokenIcon
          blockchainId={table.options.meta?.chainId}
          address={token}
          tooltip={symbol}
          size="lg"
          showChainIcon
        />
        <Stack gap={Spacing.xxs} alignItems="flex-start">
          <Typography variant="tableCellL">{formatBalance(getValue())}</Typography>
          <Typography variant="tableCellSRegular" color="textSecondary">
            {symbol}
          </Typography>
        </Stack>
      </Stack>
    </InlineTableCell>
  )
}
