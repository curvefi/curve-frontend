import { BigNumber } from 'bignumber.js'
import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useImperativeHandle,
  useState,
} from 'react'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage } from '@ui-kit/shared/ui/LargeTokenInput/HelperMessage'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { chipSizeClickable } from '@ui-kit/themes/components/chip'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal, formatNumber } from '@ui-kit/utils'
import { SliderInput, SliderInputProps } from '../SliderInput'
import { Balance, type Props as BalanceProps } from './Balance'
import { BalanceTextField } from './BalanceTextField'

const { Spacing } = SizesAndSpaces

/** A chip can be something like 50% or 'Max', and is shown on the top right on hover on desktop or always visible on tablet and lower. */
type InputChip = {
  /** The chip button label. */
  label: string
  /** The function that returns the new input amount, possibly based on the max balance. */
  newBalance: (() => void) | ((maxBalance?: Decimal) => Decimal | undefined)
}

export type ChipsPreset = 'max' | 'range'
const CHIPS_PRESETS: Record<ChipsPreset, InputChip[]> = {
  max: [{ label: t`Max`, newBalance: (maxBalance) => maxBalance }],
  range: [25, 50, 75, 100].map((p) => ({
    label: `${p}%`,
    newBalance: (maxBalance) => maxBalance && calculateNewBalance(maxBalance, `${p}`),
  })),
}

export interface LargeTokenInputRef {
  resetBalance: () => void
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

  // TODO: receive a `maxBalance` ReactNode to allow anything to be injected
  /** Optional wallet balance configuration. Omits onClick as clicking the wallet balance is controlled behavior (sets the value in the input field) */
  walletBalance?: Omit<BalanceProps<Decimal>, 'onClick'>

  /** Optional configuration for max balance behavior, which for now are the slider and chips. */
  maxBalance?: {
    isLoading?: boolean
    balance?: Decimal
    /** Whether to display the percentage slider. */
    showSlider?: boolean
    /** Custom or preset chips to show. */
    chips?: ChipsPreset | InputChip[]
  }

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
   * Callback function triggered when the balance changes. It may be omitted when read-only.
   * @param balance The new balance value
   */
  onBalance?: (balance: Decimal | undefined) => void

  /** Optional props forwarded to the slider */
  sliderProps?: SliderInputProps<Decimal>['sliderProps']

  /** Optional children to be rendered below the input */
  children?: ReactNode
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

  return new BigNumber(max).times(newPercentage).div(100).toFixed() as Decimal
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
const bigNumEquals = (a?: Decimal, b?: Decimal) => a == b || (a != null && b != null && new BigNumber(a).isEqualTo(b))

const [MIN_PERCENTAGE, MAX_PERCENTAGE] = [0, 100]

export const LargeTokenInput = ({
  ref,
  tokenSelector,
  walletBalance,
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
  sliderProps,
  children,
}: LargeTokenInputProps) => {
  const [percentage, setPercentage] = useState<Decimal | undefined>(undefined)
  const [balance, setBalance, cancelSetBalance] = useUniqueDebounce({
    defaultValue: externalBalance,
    callback: onBalance,
    // We don't want to trigger onBalance if the value is effectively the same, e.g. "0.0" and "0.00"
    equals: bigNumEquals,
  })

  const showSlider = !!maxBalance?.showSlider && !!maxBalance?.balance
  const chips = typeof maxBalance?.chips === 'string' ? CHIPS_PRESETS[maxBalance.chips] : maxBalance?.chips
  const showChips = !!chips?.length
  const chipDisabled = disabled || maxBalance?.isLoading

  const maxBalanceValue = maxBalance?.balance
  const handlePercentageChange = useCallback(
    (newPercentage: Decimal | undefined) => {
      setPercentage(newPercentage)
      if (maxBalanceValue != null)
        setBalance(newPercentage == null ? undefined : calculateNewBalance(maxBalanceValue, newPercentage))
    },
    [maxBalanceValue, setBalance],
  )

  const handleBalanceChange = useCallback(
    (newBalance: string | undefined) => {
      // We sanitize values in NumericTextField, but temporary invalid states can still occur (e.g., "-" while typing)
      const decimalBalance = decimal(newBalance)
      if (decimalBalance == null) {
        // Cancel the debounce to prevent the input from resetting while the user is still typing
        // if the previous value was valid but the current one is temporarily invalid
        cancelSetBalance()

        /**
         * When the balance has been made empty, we don't set the internal balance state to 0, but we do emit the onBalance event
         * with undefined. This allows the UI to transition from a previously valid state to indicating "no value",
         * rather than being stuck displaying outdated valid data. For example, action cards can show "no change" instead of
         * remaining in a previous valid state that no longer matches the actual input, like going from "5" to empty input.
         */
        if (!newBalance) onBalance?.(undefined)

        return
      }

      setBalance(decimalBalance)
      setPercentage(maxBalanceValue && newBalance ? calculateNewPercentage(decimalBalance, maxBalanceValue) : undefined)
    },
    [maxBalanceValue, setBalance, cancelSetBalance, onBalance],
  )

  const updatePercentageOnNewMaxBalance = useEffectEvent((newMaxBalance?: Decimal) => {
    setPercentage(newMaxBalance && balance ? calculateNewPercentage(balance, newMaxBalance) : undefined)
  })

  /** When maxBalance changes, adjust the percentage accordingly. This ensures the slider percentage accurately reflects the balance/maxBalance ratio */
  useEffect(() => updatePercentageOnNewMaxBalance(maxBalanceValue), [maxBalanceValue])

  const resetBalance = useCallback(() => {
    setPercentage(undefined)
    setBalance(undefined)
  }, [setBalance])

  // Expose reset balance function for parent user to reset both balance and percentage, without lifting up state.
  useImperativeHandle(ref, () => ({ resetBalance }), [resetBalance])

  const onWalletBalance = useCallback(() => {
    handleBalanceChange(walletBalance?.balance)
  }, [handleBalanceChange, walletBalance?.balance])

  const componentId = useId()

  return (
    <Stack
      id={componentId}
      data-testid={testId}
      sx={{
        backgroundColor: (t) => t.design.Inputs.Large.Default.Fill,
        outline: (t) =>
          `1px solid ${isError ? t.design.Layer.Feedback.Error : t.design.Inputs.Base.Default.Border.Default}`,
      }}
    >
      <Stack gap={Spacing.xxs} sx={{ padding: Spacing.sm }}>
        {/** First row is an optional label describing the input and/or chips */}
        {(label || showChips) && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              // Prevent small size difference in inputs when there's only a label and no chips
              minHeight: chipSizeClickable['extraSmall'].height,
            }}
          >
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
                    label={<WithSkeleton loading={!!maxBalance?.isLoading}>{chip.label}</WithSkeleton>}
                    data-testid={!chipDisabled && `input-chip-${chip.label}`}
                    size="extraSmall"
                    color="default"
                    clickable
                    disabled={chipDisabled}
                    onClick={() => {
                      const newBalance = chip.newBalance(maxBalance?.balance)
                      if (newBalance !== undefined) {
                        handleBalanceChange(newBalance)
                      }
                    }}
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
            isError={isError}
            onChange={handleBalanceChange}
          />
          {tokenSelector}
        </Stack>

        {/** Third row containing input and max balances */}
        {(walletBalance || inputBalanceUsd) && (
          <Stack direction="row" justifyContent="end">
            {inputBalanceUsd != null && (
              <Typography variant="bodyXsRegular" color="textTertiary" sx={{ flexGrow: 1 }}>
                ≈ {formatNumber(inputBalanceUsd, { unit: 'dollar', abbreviate: false })}
              </Typography>
            )}

            {walletBalance && <Balance disabled={disabled} {...walletBalance} onClick={onWalletBalance} />}
          </Stack>
        )}

        {/** Fourth row showing optional slider for max balance. */}
        {showSlider && (
          <Stack sx={{ zIndex: 1 /* let slider background and border show up */ }}>
            <SliderInput
              name={name}
              disabled={disabled}
              value={percentage ?? `${MIN_PERCENTAGE}`}
              onChange={(value) => handlePercentageChange(value as Decimal)}
              sliderProps={{ 'data-rail-background': 'danger', ...sliderProps }}
              min={MIN_PERCENTAGE}
              max={MAX_PERCENTAGE}
              inputProps={{ variant: 'standard', adornment: 'percentage' }}
            />
          </Stack>
        )}
      </Stack>

      {/** Fourth row containing optional helper (or error) message */}
      {message && <HelperMessage onNumberClick={onBalance} message={message} isError={isError} />}
      {children}
    </Stack>
  )
}
