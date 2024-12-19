import type { IconButtonProps } from './types'

import * as React from 'react'
import { forwardRef, useRef } from 'react'
import { useFocusRing } from '@react-aria/focus'

import { StyledIconButton } from './styles'

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps & { className?: string; testId?: string }>(
  ({ className, children, testId, size = 'large', ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { isFocusVisible } = useFocusRing()

    return (
      <StyledIconButton
        {...props}
        data-testid={`btn-${testId}`}
        ref={ref || buttonRef}
        className={`${className || ''} ${isFocusVisible ? 'focus-visible' : ''}`}
        size={size}
      >
        {children}
      </StyledIconButton>
    )
  },
)

IconButton.displayName = 'IconButton'

export default IconButton
