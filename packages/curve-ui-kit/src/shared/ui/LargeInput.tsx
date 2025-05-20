import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Balance } from './Balance'
import { TradingSlider } from './TradingSlider'

const { Spacing, FontSize, FontWeight, Sizing } = SizesAndSpaces

function clampBalance(balance: number | string, maxBalance?: number) {
  let newBalance = Number(balance)

  // Disallow negative values.
  newBalance = Math.max(0, newBalance)

  // We only clamp the positive side if there's a max balance.
  // This is up to debate and might be removed, it could be considered annoying UX.
  if (maxBalance != null) {
    newBalance = Math.min(newBalance, maxBalance)
  }

  return newBalance
}

type HelperMessageProps = {
  message: string
  isError: boolean
}

const HelperMessage = ({ message, isError }: HelperMessageProps) => (
  <Box
    sx={{
      backgroundColor: (t) => t.design.Layer[3].Fill,
      paddingBlock: Spacing.sm,
      paddingInlineStart: Spacing.sm,
      outline: isError ? (t) => `1px solid ${t.design.Layer.Feedback.Error}` : 'none',
    }}
  >
    <Typography variant="bodyXsRegular" color={isError ? 'error' : 'textSecondary'}>
      {message}
    </Typography>
  </Box>
)

type BalanceTextFieldProps = {
  balance: number
  maxBalance?: number
  isError: boolean
  onChange: (balance: number) => void
}

const BalanceTextField = ({ balance, maxBalance, isError, onChange }: BalanceTextFieldProps) => (
  <TextField
    type="number"
    placeholder="0.00"
    variant="standard"
    value={balance}
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
          // Sadly there's no standardized CSS method to remove the number input spin buttons.
          input: { textAlign: 'right' },
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            display: 'none',
          },
          '& input': {
            padding: 0,
          },
        },
      },
    }}
    onClick={(e) => {
      /**
       * Select all content when clicked.
       * This prevents unintended behavior when users click on the input field.
       * For example, if the field contains "5000" and a user clicks on the left
       * to type "4", it would become "45000" instead of the likely intended "4".
       */
      ;(e.target as HTMLInputElement).select()
    }}
    onChange={(e) => {
      /**
       * We clamp here and not in the onChange handler passed as property, because
       * we need to remove leading zeros from the new balance. We don't want to pass
       * `e.target` as a callback parameter.
       */
      const newBalance = clampBalance(e.target.value, maxBalance)
      e.target.value = String(newBalance) // remove leading zeros

      onChange(newBalance)
    }}
  />
)

/**
 * Props for the LargeInput component.
 */
type Props = {
  /**
   * The token selector UI element to be rendered.
   *
   * We've chosen to use React.ReactNode here to prevent coupling the relatively simple
   * LargeInput component with the more complex SelectToken feature. This approach provides better composability,
   * allowing you to:
   *
   * 1. Slot in any token selector implementation
   * 2. Handle the callbacks of the token selector in the parent component
   * 3. Feed props back to LargeInput via its properties
   * 4. Customize labels like 'You pay' more easily
   *
   * See the storybook for simple implementation examples of LargeInput.
   *
   * Note: We'll likely create a new 'feature' component that combines this LargeInput component with
   * a token selector and other required app interactions.
   */
  tokenSelector: React.ReactNode

  /**
   * The maximum balance available for this input.
   * When provided, enables percentage-based input via the slider.
   */
  maxBalance?: number

  /** Optional message to display below the input, called the 'helper message'. Can be an error. */
  message?: string

  /**
   * Whether the input is in an error state.
   * @default false
   */
  isError?: boolean

  /**
   * Callback function triggered when the balance changes.
   * @param balance The new balance value
   */
  onBalance: (balance: number) => void
}

export const LargeInput = ({ tokenSelector, maxBalance, message, isError = false, onBalance }: Props) => {
  const [percentage, setPercentage] = useState(0)
  const [balance, setBalance] = useState(0)

  const handlePercentageChange = useCallback(
    (newPercentage: number) => {
      if (!maxBalance) return

      setPercentage(newPercentage)
      setBalance((maxBalance * newPercentage) / 100)
    },
    [maxBalance],
  )

  const handleBalanceChange = useCallback(
    (newBalance: number) => {
      setBalance(newBalance)

      if (maxBalance) {
        // Calculate percentage based on new balance and round to 2 decimal places
        const calculatedPercentage = (newBalance / maxBalance) * 100
        const newPercentage = Math.min(Math.round(calculatedPercentage * 100) / 100, 100)
        setPercentage(newPercentage)
      }
    },
    [maxBalance],
  )

  /**
   * Invoke onBalance callback to notify parent component when balance changes
   * Could argue about debouncing this, but I'd rather put that burden on the
   * parent, such that in isolation this component is unbiased and responsive.
   */
  useEffect(() => {
    onBalance(balance)
  }, [balance, onBalance])

  /**
   * When maxBalance changes, adjust the slider and balance values accordingly
   *
   * This ensures:
   * 1. The current balance remains valid relative to the new max
   * 2. The slider percentage accurately reflects the balance/maxBalance ratio
   */
  useEffect(() => {
    handleBalanceChange(clampBalance(balance, maxBalance))
  }, [balance, handleBalanceChange, maxBalance])

  return (
    <Stack
      gap={Spacing.xs}
      sx={{
        backgroundColor: (t) => t.design.Inputs.Large.Default.Fill,
        padding: Spacing.md,
        outline: isError ? (t) => `1px solid ${t.design.Layer.Feedback.Error}` : 'none',
      }}
    >
      <Stack gap={Spacing.xs}>
        {/** First row containing the token selector and balance input text */}
        <Stack direction="row" alignItems="end">
          {tokenSelector}

          <BalanceTextField
            balance={balance}
            maxBalance={maxBalance}
            isError={isError}
            onChange={handleBalanceChange}
          />
        </Stack>

        {/** Second row containing balance and sliders */}
        <Stack
          direction="row"
          gap={Spacing.sm}
          sx={{
            minHeight: Sizing.sm, // same height as slider so height doesn't jump if maxBalance becomes available
            zIndex: 1, // required otherwise the slider background and border don't show up
          }}
        >
          <Balance
            symbol="ETH"
            balance={maxBalance}
            notionalValue={1234}
            max={maxBalance ? 'balance' : 'off'}
            onMax={() => handlePercentageChange(100)}
          />
          {maxBalance && (
            <TradingSlider
              percentage={percentage}
              onPercentageChange={handlePercentageChange}
              onPercentageCommitted={handlePercentageChange}
            />
          )}
        </Stack>
      </Stack>

      {/** Third row containing optional helper (or error) message */}
      {message && <HelperMessage message={message} isError={isError} />}
    </Stack>
  )
}
