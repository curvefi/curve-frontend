import { BigNumber } from 'bignumber.js'
import { type ReactNode, type Ref, useCallback, useEffect, useImperativeHandle, useState, useId } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useDebounce } from '@ui-kit/hooks/useDebounce'
import { Duration, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, type Amount, type Decimal } from '@ui-kit/utils'
import { Balance, type Props as BalanceProps } from './Balance'
import { type DataType, NumericTextField } from './NumericTextField'
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

type BalanceTextFieldProps<T> = {
  balance: T | undefined
  maxBalance?: T
  isError: boolean
  disabled?: boolean
  onCommit: (balance: T | undefined) => void
  name: string
} & DataType<T>

const BalanceTextField = <T extends Amount>({
  balance,
  name,
  isError,
  onCommit,
  disabled,
  dataType,
}: BalanceTextFieldProps<T>) => (
  <NumericTextField<T>
    dataType={dataType}
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
    onChange={onCommit}
    disabled={disabled}
  />
)

export interface LargeTokenInputRef {
  resetBalance: () => void
}

/**
 * Configuration for maximum balance display and input.
 * When provided, enables percentage-based input via the slider.
 *
 * @property {number} [balance] - The maximum numerical balance available for this input.
 * @property {number} [notionalValueUsd] - The notional value (in USD) of the maximum balance.
 * @property {string} [symbol] - The token symbol (e.g., 'ETH').
 * @property {boolean} [showBalance=true] - Whether to display the balance component.
 *                                        When true, shows the token balance and notional value.
 *                                        When false, hides the balance display.
 * @property {boolean} [showSlider=true] - Whether to display the percentage slider.
 *                                       When true, shows the slider for percentage-based input.
 *                                       When false, hides the slider but still allows direct input.
 */
type MaxBalanceProps<T> = Partial<
  Pick<BalanceProps<T>, 'balance' | 'notionalValueUsd' | 'symbol' | 'loading' | 'maxTestId' | 'max' | 'onMax'>
> & {
  showBalance?: boolean
  showSlider?: boolean
  showChips?: boolean
}

type Props<T> = DataType<T> & {
  ref?: Ref<LargeTokenInputRef>

  /**
   * The current balance value of the input.
   * If undefined, the input is considered uncontrolled.
   */
  balance?: T

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

  /**
   * Maximum balance configuration for the input.
   * {@link MaxBalanceProps}
   */
  maxBalance?: MaxBalanceProps<T>

  /** Optional usd value of the balance given as input. */
  inputBalanceUsd?: T

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
   * Number of decimal places to round balance values to when calculating from percentage.
   * @default 4
   */
  balanceDecimals?: number

  /**
   * Callback function triggered when the balance changes.
   * @param balance The new balance value
   */
  onBalance: (balance: T | undefined) => void
}

/**
 * Calculate the new balance based on max balance and percentage, rounding to specified decimals
 */
function calculateNewBalance<T extends Amount>(max: T, newPercentage: Decimal, balanceDecimals: number | undefined): T {
  // Avoid loss of precision when clicking 'Max'
  if (Number(newPercentage) === 100) return max

  let newBalance = new BigNumber(max).times(newPercentage).div(100)
  if (balanceDecimals != null) {
    // toFixed can make the newBalance>max due to rounding, so ensure it doesn't exceed maxBalance
    newBalance = BigNumber.min(newBalance.toFixed(balanceDecimals), max)
  }
  return (typeof max !== 'number' ? newBalance.toString() : newBalance.toNumber()) as T
}

/**
 * Calculate percentage based on the new balance and round to 2 decimal places.
 */
const calculateNewPercentage = <T extends Amount>(newBalance: T, max: T) =>
  new BigNumber(newBalance)
    .div(max)
    .times(100)
    .toFixed(2)
    .replace(/\.?0+$/, '') as Decimal

export const LargeTokenInput = <T extends Amount>({
  ref,
  tokenSelector,
  maxBalance,
  message,
  label,
  name,
  isError = false,
  disabled,
  balanceDecimals = 4,
  onBalance,
  balance: externalBalance,
  inputBalanceUsd,
  testId,
  dataType,
}: Props<T>) => {
  const [percentage, setPercentage] = useState<Decimal | undefined>(undefined)
  const [balance, setBalance] = useDebounce(externalBalance, Duration.FormDebounce, onBalance)

  // Set defaults for showSlider and showBalance to true if maxBalance is provided
  const showSlider = maxBalance && maxBalance.showSlider !== false
  const showWalletBalance = maxBalance && maxBalance.showBalance !== false
  const isDesktop = useIsDesktop()

  const handlePercentageChange = useCallback(
    (newPercentage: Decimal | undefined) => {
      setPercentage(newPercentage)
      if (maxBalance?.balance == null) return
      setBalance(
        newPercentage == null ? undefined : calculateNewBalance(maxBalance.balance, newPercentage, balanceDecimals),
      )
    },
    [maxBalance?.balance, balanceDecimals, setBalance],
  )

  const handleBalanceChange = useCallback(
    (newBalance: T | undefined) => {
      if (newBalance == null) return
      setBalance(newBalance)
      setPercentage(
        maxBalance?.balance && newBalance ? calculateNewPercentage(newBalance, maxBalance.balance) : undefined,
      )
    },
    [maxBalance?.balance, setBalance],
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

  const onMax = useCallback(() => {
    handlePercentageChange('100')
    maxBalance?.onMax?.call(null)
  }, [handlePercentageChange, maxBalance?.onMax])

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
        {(label || maxBalance?.showChips) && (
          <Stack direction="row" alignItems="center">
            {label && (
              <Typography variant="bodyXsRegular" color="textSecondary">
                {label}
              </Typography>
            )}

            {maxBalance?.showChips && (
              <Stack
                direction="row"
                gap={Spacing.xxs}
                sx={{
                  flexGrow: 1,
                  justifyContent: 'end',
                  // Hide by default, show on parent hover
                  opacity: 0,
                  transition: `opacity ${TransitionFunction}`,
                  // Show when parent stack is hovered
                  [`#${componentId}:hover &`]: {
                    opacity: 1,
                  },
                  ...(!isDesktop && { opacity: 1 }),
                }}
              >
                {[25, 50, 75, 100].map((percent) => (
                  <Chip
                    key={`input-chip-${percent}`}
                    label={`${percent}%`}
                    size="extraSmall"
                    color="default"
                    clickable
                    onClick={() => handlePercentageChange(`${percent}`)}
                  ></Chip>
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {/** Second row containing the token selector and balance input text */}
        <Stack direction="row" alignItems="center" gap={Spacing.md}>
          <BalanceTextField<T>
            disabled={disabled}
            balance={balance}
            name={name}
            maxBalance={maxBalance?.balance}
            isError={isError}
            onCommit={handleBalanceChange}
            dataType={dataType}
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
                symbol={maxBalance?.symbol ?? ''}
                balance={maxBalance?.balance}
                notionalValueUsd={maxBalance?.notionalValueUsd}
                max="off"
                onMax={onMax}
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
