import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { ActivityTableCell } from './ActivityTableCell'

const { Spacing } = SizesAndSpaces

type TokenAmountCellProps = {
  /** The amount to display (can be positive or negative) */
  amount: number | null | undefined
  /** The token symbol to display after the amount */
  symbol?: string
  /** Optional USD value to display below the amount */
  amountUsd?: number | null
  /** Whether to show color coding based on positive/negative value */
  showColorCoding?: boolean
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
export const TokenAmountCell = ({ amount, symbol, amountUsd, showColorCoding = true, align = 'left', tokenAddress, chainId }: TokenAmountCellProps) => {
  const getColor = () => {
    if (!showColorCoding || amount === 0 || amount == null) return 'textPrimary'
    return amount > 0 ? 'success' : 'error'
  }

  const formatAmount = () => {
    if (amount == null || amount === 0) return '-'
    const prefix = amount > 0 ? '+' : ''
    const formattedAmount = formatNumber(amount, { abbreviate: false })
    return symbol ? `${prefix}${formattedAmount} ${symbol}` : `${prefix}${formattedAmount}`
  }

  return (
    <ActivityTableCell>
      <Stack direction="row" justifyContent={align === 'right' ? 'flex-end' : 'flex-start'} alignItems="center" gap={Spacing.xs}>
        <Stack alignItems={align === 'right' ? 'flex-end' : 'flex-start'}>
          <Typography variant="tableCellMBold" color={getColor()}>
            {formatAmount()}
          </Typography>
          {amountUsd != null && amountUsd !== 0 && (
            <Typography variant="bodySRegular">{formatNumber(amountUsd, { unit: 'dollar', abbreviate: true })}</Typography>
          )}
        </Stack>
        {tokenAddress && <TokenIcon blockchainId={chainId} address={tokenAddress} size="mui-sm" />}
      </Stack>
    </ActivityTableCell>
  )
}
