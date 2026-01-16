import { ChangeEvent } from 'react'
import { styled } from 'styled-components'

interface NumberFieldProps {
  className?: string
  delay?: number
  value: string
  isDisabled?: boolean
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  maxDecimals?: number
}

export const NumberField = ({
  value,
  isDisabled = false,
  onChange,
  maxDecimals = 18,
  onFocus,
  onBlur,
}: NumberFieldProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow numbers and both . and , as decimal separators
    if (!/^\d*[.,]?\d*$/.test(value)) return
    // Normalize , to . for internal handling
    const normalizedValue = value.replace(',', '.')
    // Remove leading zeros
    const cleanValue = normalizedValue.replace(/^0+(\d)/, '$1')
    // Prevent more than maxDecimals decimal places
    const [, decimal] = cleanValue.split('.')
    if (decimal && decimal.length > maxDecimals) return

    onChange?.(cleanValue === '' ? '0' : cleanValue)
  }

  return (
    <StyledInput
      type="text"
      inputMode="decimal"
      value={value}
      isDisabled={isDisabled}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

const StyledInput = styled.input<{ isDisabled?: boolean }>`
  padding: var(--spacing-1) var(--spacing-1);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-3);
  color: var(--page--text-color);
  cursor: ${({ isDisabled }) => (isDisabled ? 'cursor' : 'pointer')};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'pointer' : 'auto')};
  background-color: transparent;
  caret-color: ${({ isDisabled }) => (isDisabled ? 'transparent' : 'var(--page--text-color)')};
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: none;
  }
`
