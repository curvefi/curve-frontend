import { type Ref, type ReactNode, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useDebounce } from '@ui-kit/hooks/useDebounce'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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
      backgroundColor: (t) => t.design.Layer[3].Fill,
      paddingBlock: Spacing.sm,
      paddingInlineStart: Spacing.sm,
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

type BalanceTextFieldProps = {
  balance: number | undefined
  maxBalance?: number
  isError: boolean
  disabled?: boolean
  onCommit: (balance: number | undefined) => void
  name: string
}

const BalanceTextField = ({ balance, name, isError, onCommit, disabled }: BalanceTextFieldProps) => (
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
type MaxBalanceProps = Partial<
  Pick<BalanceProps, 'balance' | 'notionalValueUsd' | 'symbol' | 'loading' | 'maxTestId' | 'max' | 'onMax'>
> & {
  showBalance?: boolean
  showSlider?: boolean
}

type Props = {
  ref?: Ref<LargeTokenInputRef>

  /**
   * The current balance value of the input.
   * If undefined, the input is considered uncontrolled.
   */
  balance?: number | undefined

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
  maxBalance?: MaxBalanceProps

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
  onBalance: (balance: number | undefined) => void
}

export const LargeTokenInput = ({
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
  testId,
}: Props) => {
  const [percentage, setPercentage] = useState<number | undefined>(undefined)
  const [balance, setBalance] = useDebounce(externalBalance, Duration.FormDebounce, onBalance)

  // Set defaults for showSlider and showBalance to true if maxBalance is provided
  const showSlider = maxBalance && maxBalance.showSlider !== false
  const showBalance = maxBalance && maxBalance.showBalance !== false
  const showMaxBalance = showSlider || showBalance

  const handlePercentageChange = useCallback(
    (newPercentage: number | undefined) => {
      setPercentage(newPercentage)

      if (maxBalance?.balance == null) return

      if (newPercentage == null) {
        setBalance(undefined)
        return
      }

      let newBalance = (maxBalance.balance * newPercentage) / 100
      if (balanceDecimals != null) {
        // toFixed can make the newBalance>max due to rounding, so ensure it doesn't exceed maxBalance
        newBalance = Math.min(+newBalance.toFixed(balanceDecimals), maxBalance.balance)
      }

      setBalance(newBalance)
    },
    [maxBalance?.balance, balanceDecimals, setBalance],
  )

  const handleBalanceChange = useCallback(
    (newBalance: number | undefined) => {
      if (newBalance == null) return

      setBalance(newBalance)

      if (maxBalance?.balance && newBalance) {
        // Calculate percentage based on new balance and round to 2 decimal places
        const calculatedPercentage = (newBalance / maxBalance.balance) * 100
        const newPercentage = Math.min(Math.round(calculatedPercentage * 100) / 100, 100)
        setPercentage(newPercentage)
      } else {
        setPercentage(undefined)
      }
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
    const callback = maxBalance?.onMax
    handlePercentageChange(100)
    callback?.()
  }, [handlePercentageChange, maxBalance?.onMax])

  return (
    <Stack
      data-testid={testId}
      gap={Spacing.xs}
      sx={{
        backgroundColor: (t) => t.design.Inputs.Large.Default.Fill,
        padding: Spacing.md,
        outline: (t) =>
          `1px solid ${isError ? t.design.Layer.Feedback.Error : t.design.Inputs.Base.Default.Border.Default}`,
      }}
    >
      <Stack gap={Spacing.xs}>
        {/** First row is an optional label describing the input */}
        {label && (
          <Typography variant="bodyXsRegular" color="textSecondary">
            {label}
          </Typography>
        )}

        {/** Second row containing the token selector and balance input text */}
        <Stack direction="row" alignItems="center" gap={Spacing.md}>
          <BalanceTextField
            disabled={disabled}
            balance={balance}
            name={name}
            maxBalance={maxBalance?.balance}
            isError={isError}
            onCommit={handleBalanceChange}
          />

          {tokenSelector}
        </Stack>

        {/** Third row containing (max) balance and sliders */}
        {showMaxBalance && (
          <Stack
            direction="row"
            gap={Spacing.sm}
            sx={{
              minHeight: Sizing.sm, // same height as slider so height doesn't jump if maxBalance becomes available
              zIndex: 1, // required otherwise the slider background and border don't show up
            }}
          >
            {showBalance && (
              <Balance
                disabled={disabled}
                symbol={maxBalance?.symbol ?? ''}
                balance={maxBalance?.balance}
                notionalValueUsd={maxBalance?.notionalValueUsd}
                max={maxBalance.max ?? 'button'}
                onMax={onMax}
                // Stretch the balance component if there's no slider so the max button can reach the end
                sx={{ ...(!showSlider && { flexGrow: 1 }) }}
              />
            )}

            {showSlider && (
              <TradingSlider
                disabled={disabled}
                percentage={percentage}
                onChange={handlePercentageChange}
                onCommit={handlePercentageChange}
              />
            )}
          </Stack>
        )}
      </Stack>

      {/** Fourth row containing optional helper (or error) message */}
      {message && <HelperMessage message={message} isError={isError} />}
    </Stack>
  )
}
