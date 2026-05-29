import { forwardRef, useRef } from 'react'
import { StyledInput } from './styles'
import type { InputProps } from './types'

// eslint-disable-next-line @eslint-react/no-forward-ref -- Existing violation before enabling this rule.
export const Input = forwardRef<HTMLInputElement, InputProps & { testId?: string }>(
  ({ id, globalDisabled, testId, ...inputProps }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const { disabled, ...props } = inputProps ?? {}

    return (
      <StyledInput
        type="text"
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
        ref={ref || inputRef}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
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
