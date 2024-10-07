
import { useFocusRing } from '@react-aria/focus'
import * as React from 'react'
import { forwardRef, useRef } from 'react'

import { StyledIconButton } from './styles'
import type { IconButtonProps } from './types'

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps & { className?: string; testId?: string }>(
  ({ className, children, testId, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { isFocusVisible } = useFocusRing()

    return (
      <StyledIconButton
        {...props}
        data-testid={`btn-${testId}`}
        ref={ref || buttonRef}
        className={`${className || ''} ${isFocusVisible ? 'focus-visible' : ''}`}
      >
        {children}
      </StyledIconButton>
    )
  }
)

IconButton.defaultProps = {
  className: '',
  size: 'large',
}

IconButton.displayName = 'IconButton'

export default IconButton
