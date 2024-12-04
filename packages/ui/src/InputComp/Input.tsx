import type { InputProps } from './types'

import * as React from 'react'
import { forwardRef, useRef } from 'react'

import { StyledInput } from './styles'

const Input = forwardRef<HTMLInputElement, InputProps & { testId?: string }>(
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

export default Input
