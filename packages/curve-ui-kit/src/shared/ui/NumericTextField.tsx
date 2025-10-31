import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { type Decimal } from '@ui-kit/utils'

/**
 * Validates and normalizes numeric input by replacing commas with dots
 * and ensuring only valid numeric characters are allowed.
 * Prevents multiple decimal points and ensures minus sign is only at the beginning.
 *
 * @param value - The new input value to validate
 * @param current - The current input value to fall back to if validation fails
 * @returns The validated and normalized input value, or the current value if invalid
 */
const sanitize = (value: string, current: string): string => {
  const normalizedValue = value.replace(/,/g, '.')

  // If more than one decimal point, return the current value (ignore the change)
  if ((normalizedValue.match(/\./g) || []).length > 1) {
    return current
  }

  // If minus is not at the beginning, ignore the change
  const minusIndex = normalizedValue.indexOf('-')
  if (minusIndex > 0) {
    return current
  }

  // Check if it contains only valid characters (numbers, optional minus at start if allowed, and one optional decimal)
  const pattern = /^-?[0-9]*\.?[0-9]*([eE][-+]?[0-9]+)?$/
  return pattern.test(normalizedValue) ? normalizedValue : current
}

/**
 * Clamps a numeric value to ensure it's within the specified range.
 *
 * @param value - The value to clamp (number or string representation)
 * @param min - The minimum allowed value (default: -Infinity)
 * @param max - The maximum allowed value (default: Infinity)
 * @returns A number within the specified range, or min if the input is invalid/NaN
 */
const clamp = (value?: string, min?: Decimal, max?: Decimal): BigNumber => {
  const bigMin = new BigNumber(min ?? -Infinity)
  const bigMax = new BigNumber(max ?? Infinity)
  const num = value ? new BigNumber(value) : bigMin
  return num.isNaN() ? bigMin : BigNumber.max(bigMin, BigNumber.min(bigMax, num))
}

/**
 * Converts a numeric value to its display representation.
 * Returns an empty string for undefined/null values to improve UX by showing
 * a blank field when no value is set.
 */
const getDisplayValue = (val?: Decimal) => (val == null ? '' : String(val))

/**
 * Computes a formatted value for display purposes.
 * Applies an optional formatter when provided and the value is defined.
 */
const getFormattedDisplayValue = (val: Decimal | undefined, format?: (value: Decimal | undefined) => string) => {
  if (val == null) {
    return ''
  }
  return format?.(val) ?? getDisplayValue(val)
}

/**
 * Props for the NumericTextField component.
 * Extends Material-UI's TextFieldProps while replacing value and onChange
 * to handle numeric input specifically.
 */
export type NumericTextFieldProps = Omit<TextFieldProps, 'type' | 'value' | 'onChange' | 'onBlur'> & {
  /** The numeric value of the input field */
  value: Decimal | undefined
  /** Minimum allowed value (default: 0) */
  min?: Decimal
  /** Maximum allowed value (default: Infinity) */
  max?: Decimal
  /** Callback fired when the numeric value changes, can be a temporary non decimal value like "5." or "-" */
  onChange?: (value: string | undefined) => void
  /** Callback fired when the numeric is being submitted */
  onBlur?: (value: Decimal | undefined) => void
  /** Optional formatter applied when the input loses focus */
  formatOnBlur?: (value: Decimal | undefined) => string
  // extended to support data-testid attribute
  [key: `data-${string}`]: string | undefined
}

export const NumericTextField = ({
  value,
  min,
  max,
  onChange,
  onBlur,
  onFocus,
  formatOnBlur,
  ...props
}: NumericTextFieldProps) => {
  // Internal value that might be incomplete, like "4.".
  const [inputValue, setInputValue] = useState(getFormattedDisplayValue(value, formatOnBlur))

  const [lastChangeValue, setLastChangeValue] = useState<string | undefined>(value)
  const [lastBlurValue, setLastBlurValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  // Update input value when value changes externally
  useEffect(() => {
    setInputValue(isFocused ? getDisplayValue(value) : getFormattedDisplayValue(value, formatOnBlur))
  }, [value, isFocused, formatOnBlur])

  return (
    <TextField
      {...props}
      type="text"
      value={inputValue}
      inputMode="decimal"
      onFocus={(e) => {
        setIsFocused(true)
        /**
         * Select all content when clicked.
         * This prevents unintended behavior when users click on the input field.
         * For example, if the field contains "5000" and a user clicks on the left
         * to type "4", it would become "45000" instead of the likely intended "4".
         */
        ;(e.target as HTMLInputElement).select()
        onFocus?.(e)
      }}
      onChange={(e) => {
        const sanitizedValue = sanitize(e.target.value, inputValue)
        setInputValue(sanitizedValue)
        onChange?.(sanitizedValue)
        setLastChangeValue(sanitizedValue)
      }}
      onBlur={() => {
        setIsFocused(false)
        // Replace a sole invalid values with just empty input as they're not really valid.
        const invalidValues = ['-', '.', ',', '']
        const finalValue = invalidValues.includes(inputValue)
          ? undefined
          : (clamp(inputValue, min, max).toString() as Decimal)
        setInputValue(getFormattedDisplayValue(finalValue, formatOnBlur))

        // Also emit the changed event, because due to clamping and such the final value
        // might differ from what the user entered last.
        if (finalValue !== lastChangeValue) {
          onChange?.(finalValue)
          setLastChangeValue(finalValue)
        }

        if (finalValue !== lastBlurValue) {
          onBlur?.(finalValue)
          setLastBlurValue(finalValue)
        }
      }}
    />
  )
}
