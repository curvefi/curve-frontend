import { forwardRef, useRef } from 'react'
import { StyledInput } from './styles'
import type { InputProps } from './types'

export const Input = forwardRef<HTMLInputElement, InputProps & { testId?: string }>(
  ({ id, globalDisabled, testId, ...inputProps }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const { disabled, ...props } = inputProps ?? {}

    return (
      <StyledInput
        type="text"
        ref={ref || inputRef}
        disabled={disabled || globalDisabled}
        {...props}
        data-testid={`inp-${testId}`}
        id={id}
        name={id}
      />
    )
  },
)

Input.displayName = 'Input'
