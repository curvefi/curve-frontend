import { BigNumber } from 'bignumber.js'
import { type ReactNode, type Ref, useCallback, useEffect, useImperativeHandle, useState, useId, useMemo } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { Duration, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, formatNumber, type Decimal } from '@ui-kit/utils'
import { Balance, type Props as BalanceProps } from './Balance'
import { NumericTextField } from './NumericTextField'
import { TradingSlider } from './TradingSlider'

const { Spacing, FontSize, FontWeight, Sizing } = SizesAndSpaces

type HelperMessageProps = {
  message: string | ReactNode
  isError: boolean
}

const HelperMessage = ({ message, isError }: HelperMessageProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: (t) => t.design.Layer[3].Fill,
      padding: Spacing.sm,
      minHeight: Sizing.sm,
      ...(isError && { backgroundColor: (t) => t.design.Layer.Feedback.Error }),
    }}
  >
    {typeof message === 'string' ? (
      <Typography
        variant="bodyXsRegular"
        // todo: replace with alert component and add filledfeedback colors to alert component.
        sx={{
          color: (t) =>
            isError ? t.design.Text.TextColors.FilledFeedback.Warning.Primary : t.design.Text.TextColors.Tertiary,
        }}
      >
        {message}
      </Typography>
    ) : (
      message
    )}
  </Box>
)

/** A chip can be something like 50% or 'Max', and is shown on the top right on hover on desktop or always visible on tablet and lower. */
type InputChip = {
  /** The chip button label. */
  label: string
  /** The function that returns the new input amount, possibly based on the max balance. */
  newBalance: (maxBalance?: Decimal) => Decimal | undefined
}

type ChipsPreset = 'max' | 'range'
const CHIPS_PRESETS: Record<ChipsPreset, InputChip[]> = {
  max: [{ label: t`Max`, newBalance: (maxBalance) => maxBalance }],
  range: [25, 50, 75, 100].map((p) => ({
    label: `${p}%`,
    newBalance: (maxBalance) => maxBalance && calculateNewBalance(maxBalance, `${p}` as Decimal),
  })),
}

type BalanceTextFieldProps = {
  balance: Decimal | undefined
  maxBalance?: Decimal
  isError: boolean
  disabled?: boolean
  /** Callback fired when the numeric value changes, can be a temporary non decimal value like "5." or "-" */
  onChange: (balance: string | undefined) => void
  name: string
}

const BalanceTextField = ({ balance, name, isError, onChange, disabled }: BalanceTextFieldProps) => (
  <NumericTextField
    placeholder="0.00"
    variant="standard"
    value={balance}
    name={name}
    fullWidth
    slotProps={{
      input: {
        disableUnderline: true,
        sx: {
          backgroundColor: (t) => t.design.Inputs.Large.Default.Fill,
          fontFamily: (t) => t.typography.highlightXl.fontFamily,
          fontSize: FontSize.xl,
          fontWeight: FontWeight.Bold,
          color: (t) => (isError ? t.design.Layer.Feedback.Error : t.design.Text.TextColors.Primary),
        },
      },
    }}
    onChange={onChange}
    disabled={disabled}
  />
)

export interface LargeTokenInputRef {
  resetBalance: () => void
}

/** Configuration for wallet balance display and input. */
type WalletBalanceProps = {
  symbol?: string
  usdRate?: number
} & Pick<BalanceProps<Decimal>, 'balance' | 'loading' | 'clickTestId' | 'onClick' | 'notionalValueUsd'>

/**
 * Massages the given wallet balance props for the actual wallet Balance component,
 * based on token balance, its usd rate and more as expected by the Balance component in @ui-kit.
 *
 * Any given notionalValueUsd will be overridden if both balance and usdRate are provided.
 *
 * @param symbol - The symbol of the token (e.g., "ETH")
 * @param usdRate - The USD exchange rate for the token (e.g., 1.05)
 */
const createWalletBalance = ({ balance, symbol, loading, usdRate, ...props }: WalletBalanceProps) => ({
  ...props,
  balance,
  symbol: symbol ?? '-',
  loading: loading ?? balance == null,
  ...(balance != null && usdRate != null && { notionalValueUsd: usdRate * +balance }),
})

/** Configuration for max balance behavior, which for now are the slider and chips. */
type MaxBalanceProps = {
  balance?: Decimal
  /** Whether to display the percentage slider. */
  showSlider?: boolean
  /** Custom or preset chips to show. */
  chips?: ChipsPreset | InputChip[]
}

export type LargeTokenInputProps = {
  ref?: Ref<LargeTokenInputRef>

  /**
   * The current balance value of the input.
   * If undefined, the input is considered uncontrolled.
   */
  balance?: Decimal

  /**
   * The token selector UI element to be rendered.
   *
   * We've chosen to use ReactNode here to prevent coupling the relatively simple
   * LargeTokenInput component with the more complex SelectToken feature. This approach provides better composability,
   * allowing you to:
   *
   * 1. Slot in any token selector implementation
   * 2. Handle the callbacks of the token selector in the parent component
   * 3. Feed props back to LargeTokenInput via its properties
   *
   * See the storybook for simple implementation examples of LargeTokenInput.
   *
   * Note: We'll likely create a new 'feature' component that combines this LargeTokenInput component with
   * a token selector and other required app interactions.
   */
  tokenSelector?: ReactNode

  /** Optional wallet balance configuration. */
  walletBalance?: WalletBalanceProps

  /** Optional max balance configuration */
  maxBalance?: MaxBalanceProps

  /** Optional usd value of the balance given as input. */
  inputBalanceUsd?: Decimal

  /**
   * Optional message to display below the input, called the 'helper message'.
   * Can also be used for displaying an error message.
   * Can be a string or a ReactNode for greater message customization and styling.
   */
  message?: string | ReactNode

  /** Optional label explaining what the input is all about. */
  label?: string

  /** Name attribute for the input element, useful for form handling and identification. */
  name: string

  /** Optional test ID for testing purposes. */
  testId?: string

  /**
   * Whether the input is in an error state.
   * @default false
   */
  isError?: boolean

  /**
   * Whether the input is disabled.
   * IMPORTANT: Whatever in tokenSelector will not be disabled by this component, it needs to be disabled separately.
   * @default false
   */
  disabled?: boolean

  /**
   * Callback function triggered when the balance changes.
   * @param balance The new balance value
   */
  onBalance: (balance: Decimal | undefined) => void
}

/**
 * Calculates a new balance based on a percentage of the maximum balance.
 *
 * This function is used when users interact with percentage-based inputs (like sliders or percentage chips)
 * to determine the corresponding token amount.
 *
 * @param max - The maximum balance available (e.g., wallet balance)
 * @param newPercentage - The percentage to calculate (0-100, can have decimals like "25.5")
 *
 * @returns The calculated balance amount, maintaining the same type as the input `max`
 */
function calculateNewBalance(max: Decimal, newPercentage: Decimal): Decimal {
  // Avoid loss of precision when clicking 'Max' or '100%'.
  if (Number(newPercentage) === 100) return max

  return new BigNumber(max).times(newPercentage).div(100).toString() as Decimal
}

/**
 * Calculate percentage based on the new balance and round to 2 decimal places.
 *
 * This function is the inverse of `calculateNewBalance` and is used to update the slider
 * position when the user directly inputs a balance amount. It converts the current balance
 * to a percentage value that can be displayed on UI elements like sliders or progress bars.
 *
 * @param newBalance - The current balance amount to convert to percentage
 * @param max - The maximum balance to calculate percentage against
 */
const calculateNewPercentage = (newBalance: Decimal, max: Decimal) =>
  new BigNumber(newBalance)
    .div(max)
    .times(100)
    .toFixed(2)
    .replace(/\.?0+$/, '') as Decimal

/** Converts two decimals to BigNumber for comparison. Undefined is considered zero. */
const bigNumEquals = (a?: Decimal, b?: Decimal) => new BigNumber(a ?? 0).isEqualTo(b ?? 0)

export const LargeTokenInput = ({
  ref,
  tokenSelector,
  walletBalance: walletBalanceRaw,
  maxBalance,
  message,
  label,
  name,
  isError = false,
  disabled,
  onBalance,
  balance: externalBalance,
  inputBalanceUsd,
  testId,
}: LargeTokenInputProps) => {
  const [percentage, setPercentage] = useState<Decimal | undefined>(undefined)
  const [balance, setBalance, cancelSetBalance] = useUniqueDebounce({
    defaultValue: externalBalance,
    callback: onBalance,
    debounceMs: Duration.FormDebounce,
    // We don't want to trigger onBalance if the value is effectively the same, e.g. "0.0" and "0.00"
    equals: bigNumEquals,
  })

  const showSlider = !!maxBalance?.showSlider && !!maxBalance?.balance

  const walletBalance = useMemo(() => walletBalanceRaw && createWalletBalance(walletBalanceRaw), [walletBalanceRaw])
  const showWalletBalance = !!walletBalance

  const chips = typeof maxBalance?.chips === 'string' ? CHIPS_PRESETS[maxBalance.chips] : maxBalance?.chips
  const showChips = !!chips?.length

  const handlePercentageChange = useCallback(
    (newPercentage: Decimal | undefined) => {
      setPercentage(newPercentage)
      if (maxBalance?.balance == null) return
      setBalance(newPercentage == null ? undefined : calculateNewBalance(maxBalance.balance, newPercentage))
    },
    [maxBalance?.balance, setBalance],
  )

  const handleBalanceChange = useCallback(
    (newBalance: string | undefined) => {
      // In case the input is somehow invalid, although we do our best to sanitize it in NumericTextField,
      // we cancel the debounce such that the input won't reset while still typing.
      const decimalBalance = decimal(newBalance)
      if (decimalBalance == null) {
        cancelSetBalance()
        return
      }

      setBalance(decimalBalance)
      setPercentage(
        maxBalance?.balance && newBalance ? calculateNewPercentage(decimalBalance, maxBalance.balance) : undefined,
      )
    },
    [maxBalance?.balance, setBalance, cancelSetBalance],
  )

  const handleChip = useCallback(
    (chip: InputChip) => {
      handleBalanceChange(chip.newBalance(maxBalance?.balance))
    },
    [handleBalanceChange, maxBalance?.balance],
  )

  /**
   * When maxBalance changes, adjust the slider and balance values accordingly
   * This ensures the slider percentage accurately reflects the balance/maxBalance ratio
   *
   * Changing the percentage changes the balance, which in turn triggers this useEffect,
   * which in turn changes the percentage again. While I am using the current balance,
   * I really only care about triggering it when maxBalance changes
   */
  useEffect(() => {
    handleBalanceChange(balance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxBalance?.balance])

  const resetBalance = useCallback(() => {
    setPercentage(undefined)
    setBalance(undefined)
  }, [setBalance])

  // Expose reset balance function for parent user to reset both balance and percentage, without lifting up state.
  useImperativeHandle(ref, () => ({ resetBalance }), [resetBalance])

  const onWalletBalance = useCallback(() => {
    handleBalanceChange(walletBalance?.balance)
    walletBalance?.onClick?.call(null)
  }, [handleBalanceChange, walletBalance?.balance, walletBalance?.onClick])

  const componentId = useId()

  return (
    <Stack
      id={componentId}
      data-testid={testId}
      gap={Spacing.sm}
      sx={{
        backgroundColor: (t) => t.design.Inputs.Large.Default.Fill,
        outline: (t) =>
          `1px solid ${isError ? t.design.Layer.Feedback.Error : t.design.Inputs.Base.Default.Border.Default}`,
      }}
    >
      <Stack gap={Spacing.xs} sx={{ padding: Spacing.sm }}>
        {/** First row is an optional label describing the input and/or chips */}
        {(label || showChips) && (
          <Stack direction="row" alignItems="center">
            {label && (
              <Typography variant="bodyXsRegular" color="textSecondary">
                {label}
              </Typography>
            )}

            {showChips && (
              <Stack
                direction="row"
                gap={Spacing.xxs}
                sx={{
                  flexGrow: 1,
                  justifyContent: 'end',
                  // Hide by default, show on parent hover
                  opacity: { desktop: 0 },
                  transition: `opacity ${TransitionFunction}`,
                  // Show when parent stack is hovered
                  [`#${componentId}:hover &`]: {
                    opacity: 1,
                  },
                }}
              >
                {chips.map((chip) => (
                  <Chip
                    key={`input-chip-${chip.label}`}
                    label={chip.label}
                    size="extraSmall"
                    color="default"
                    clickable
                    onClick={() => handleChip(chip)}
                  ></Chip>
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {/** Second row containing the token selector and balance input text */}
        <Stack direction="row" alignItems="center" gap={Spacing.md}>
          <BalanceTextField
            disabled={disabled}
            balance={balance}
            name={name}
            maxBalance={maxBalance?.balance}
            isError={isError}
            onChange={handleBalanceChange}
          />

          {tokenSelector}
        </Stack>

        {/** Third row containing input and max balances */}
        {(showWalletBalance || inputBalanceUsd) && (
          <Stack direction="row">
            {inputBalanceUsd != null && (
              <Typography variant="bodyXsRegular" color="textTertiary">
                ≈ {formatNumber(inputBalanceUsd, { unit: 'dollar', abbreviate: false })}
              </Typography>
            )}

            {showWalletBalance && (
              <Balance
                disabled={disabled}
                clickable
                symbol={walletBalance?.symbol ?? ''}
                balance={walletBalance?.balance}
                notionalValueUsd={walletBalance?.notionalValueUsd}
                loading={walletBalance?.loading}
                onClick={onWalletBalance}
                sx={{ flexGrow: 1, justifyContent: 'end' }}
              />
            )}
          </Stack>
        )}

        {/** Fourth row showing optional slider for max balance. */}
        {showSlider && (
          <Stack
            sx={{
              zIndex: 1, // required, otherwise the slider background and border don't show up
            }}
          >
            <TradingSlider
              disabled={disabled}
              percentage={percentage}
              onChange={handlePercentageChange}
              onCommit={handlePercentageChange}
            />
          </Stack>
        )}
      </Stack>

      {/** Fourth row containing optional helper (or error) message */}
      {message && <HelperMessage message={message} isError={isError} />}
    </Stack>
  )
}
