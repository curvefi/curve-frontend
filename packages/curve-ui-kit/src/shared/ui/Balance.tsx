import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

const formatNumber = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

type MaxButtonProps = {
  /** The content to display in the button */
  children: React.ReactNode
  /** Whether to show underline on hover */
  underline: boolean
  /** Callback function when button is clicked */
  onClick?: () => void
}

/** Reusable Max button component with consistent styling */
const MaxButton = ({ children, underline, onClick }: MaxButtonProps) => (
  <Button
    color="ghost"
    variant="link"
    size="extraSmall"
    onClick={onClick}
    sx={{
      minWidth: 'unset',
      '&': { height: '50px !important' },
      ...(underline && {
        '&:hover': {
          textDecoration: 'underline',
        },
      }),
    }}
  >
    {children}
  </Button>
)

/**
 * Props for the Balance component
 */
type Props = {
  /** The token symbol to display */
  symbol: string
  /** Controls how the max value is displayed:
   * - 'balance': Shows the balance as a clickable link
   * - 'button': Shows a separate 'Max' button
   * - 'off': No max functionality is shown
   */
  max: 'balance' | 'button' | 'off'
  /** The token balance amount (optional, in case of loading) */
  balance?: number
  /** The USD value of the balance (optional) */
  notionalValue?: number
  /** Whether to hide the wallet icon */
  hideIcon?: boolean
  /** Callback function when max button/balance is clicked */
  onMax?: (maxValue: number) => void
}

export const Balance = ({ symbol, max, balance, notionalValue, hideIcon, onMax }: Props) => {
  const balanceText = (
    <Stack direction="row" gap={Spacing.xs} alignItems="center">
      <Typography variant="highlightS" color={balance !== undefined ? 'textPrimary' : 'textTertiary'}>
        {balance ? formatNumber(balance) : '?'}
      </Typography>

      <Typography variant="highlightS" color="textPrimary">
        {symbol}
      </Typography>
    </Stack>
  )

  return (
    <Stack direction="row" gap={Spacing.xs} alignItems="center">
      {!hideIcon && <AccountBalanceWalletOutlinedIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />}

      {max === 'balance' && balance !== undefined ? (
        <MaxButton underline={true} onClick={() => onMax?.(balance)}>
          {balanceText}
        </MaxButton>
      ) : (
        balanceText
      )}

      {notionalValue && (
        <Typography variant="bodySRegular" color="textTertiary">
          ${formatNumber(notionalValue)}
        </Typography>
      )}

      {max === 'button' && balance !== undefined && (
        <MaxButton underline={false} onClick={() => onMax?.(balance)}>
          Max
        </MaxButton>
      )}
    </Stack>
  )
}
