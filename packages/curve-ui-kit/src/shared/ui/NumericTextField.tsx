import { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

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

  // Check if it contains only valid characters (numbers, optional minus at start, and one optional decimal)
  return /^-?[0-9]*\.?[0-9]*$/.test(normalizedValue) ? normalizedValue : current
}

/**
 * Clamps a numeric value to ensure it's within the specified range.
 *
 * @param value - The value to clamp (number or string representation)
 * @param min - The minimum allowed value (default: 0)
 * @param max - The maximum allowed value (default: Infinity)
 * @returns A number within the specified range, or min if the input is invalid/NaN
 */
const clamp = (value?: number | string, min = 0, max = Infinity) => {
  const num = Number(value)
  return isNaN(num) ? min : Math.max(min, Math.min(max, num))
}

/**
 * Converts a numeric value to its display representation.
 * Returns an empty string for undefined/null values to improve UX by showing
 * a blank field when no value is set.
 */
const getDisplayValue = (val?: number) => (val == null ? '' : String(val))

/**
 * Props for the NumericTextField component.
 * Extends Material-UI's TextFieldProps while replacing value and onChange
 * to handle numeric input specifically.
 */
type NumericTextFieldProps = Omit<TextFieldProps, 'type' | 'value' | 'onChange' | 'onBlur'> & {
  /** The numeric value of the input field */
  value: number | undefined
  /** Minimum allowed value (default: 0) */
  min?: number
  /** Maximum allowed value (default: Infinity) */
  max?: number
  /** Callback fired when the numeric value changes */
  onChange?: (value: number | undefined) => void
  /** Callback fired when the numeric is being submitted */
  onBlur?: (value: number | undefined) => void
}

export const NumericTextField = ({ value, min, max, onChange, onBlur, onFocus, ...props }: NumericTextFieldProps) => {
  // Internal value that might be incomplete, like "4.".
  const [inputValue, setInputValue] = useState(getDisplayValue(value))

  const [lastChangeValue, setLastChangeValue] = useState(value)
  const [lastBlurValue, setLastBlurValue] = useState(value)

  // Update input value when value changes externally
  useEffect(() => {
    setInputValue(getDisplayValue(value))
  }, [value])

  /**
   * Converts a string input to a numeric value with optional clamping.
   *
   * @param validatedValue - The sanitized string input
   * @param shouldClamp - Whether to apply min/max bounds
   * @returns Numeric value, undefined for empty/invalid input
   */
  const parseAndClamp = (validatedValue: string, shouldClamp = false) => {
    if (validatedValue === '') return undefined

    const numericValue = Number(validatedValue)
    return isNaN(numericValue) ? undefined : shouldClamp ? clamp(numericValue, min, max) : numericValue
  }

  return (
    <TextField
      {...props}
      type="text"
      value={inputValue}
      inputMode="decimal"
      onFocus={e => {
        /**
         * Select all content when clicked.
         * This prevents unintended behavior when users click on the input field.
         * For example, if the field contains "5000" and a user clicks on the left
         * to type "4", it would become "45000" instead of the likely intended "4".
         */
        ;(e.target as HTMLInputElement).select()
        onFocus?.(e)
      }}
      onChange={e => {
        const sanitizedValue = sanitize(e.target.value, inputValue)
        setInputValue(sanitizedValue)

        const changedValue = parseAndClamp(sanitizedValue, false)

        if (changedValue !== lastChangeValue) {
          onChange?.(changedValue)
          setLastChangeValue(changedValue)
        }
      }}
      onBlur={() => {
        // Replace a sole minus with just empty input as it's not really valid.
        const finalValue = parseAndClamp(inputValue === '-' ? '' : inputValue, true)
        setInputValue(getDisplayValue(finalValue))

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
