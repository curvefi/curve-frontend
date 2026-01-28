import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InlineTableCell } from '@ui-kit/shared/ui/DataTable/inline-cells/InlineTableCell'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type TokenAmountCellProps = {
  /** The amount to display (can be positive or negative) */
  amount: number | null | undefined
  /** The token symbol to display after the amount */
  symbol?: string
  /** Optional USD value to display below the amount */
  amountUsd?: number | null
  /** Horizontal alignment of the content */
  align?: 'left' | 'right'
  /** Token address for displaying the token icon */
  tokenAddress?: string
  /** Chain ID for fetching the token icon */
  chainId?: string
}

/**
 * Cell component for displaying token amounts with optional color coding.
 * - Positive amounts are shown in green (success)
 * - Negative amounts are shown in red (error)
 * - Zero or null amounts are shown in default text color
 */
export const TokenAmountCell = ({ amount, amountUsd, align = 'left', tokenAddress, chainId }: TokenAmountCellProps) => {
  const isRightAligned = align === 'right'

  const formatAmount = () => {
    if (amount == null || amount === 0) return '-'
    return formatNumber(amount, { abbreviate: false })
  }

  return (
    <InlineTableCell>
      <Stack
        direction="row"
        justifyContent={isRightAligned ? 'flex-end' : 'flex-start'}
        alignItems="center"
        gap={Spacing.xs}
      >
        {tokenAddress && !isRightAligned && <TokenIcon blockchainId={chainId} address={tokenAddress} size="lg" />}
        <Stack alignItems={isRightAligned ? 'flex-end' : 'flex-start'}>
          <Typography variant="tableCellMBold">{formatAmount()}</Typography>
          {amountUsd != null && amountUsd !== 0 && (
            <Typography variant="tableCellSRegular" sx={(t) => ({ color: t.design.Text.TextColors.Secondary })}>
              {formatNumber(amountUsd, { unit: 'dollar', abbreviate: true })}
            </Typography>
          )}
        </Stack>
        {tokenAddress && isRightAligned && amount != 0 && (
          <TokenIcon blockchainId={chainId} address={tokenAddress} size="lg" />
        )}
      </Stack>
    </InlineTableCell>
  )
}
