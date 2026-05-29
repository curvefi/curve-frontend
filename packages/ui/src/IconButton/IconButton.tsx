import { forwardRef, useRef } from 'react'
import { useFocusRing } from '@react-aria/focus'
import { StyledIconButton } from './styles'
import type { IconButtonProps } from './types'

// eslint-disable-next-line @eslint-react/no-forward-ref -- Existing violation before enabling this rule.
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps & { className?: string; testId?: string }>(
  ({ className, children, testId, size = 'large', ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { isFocusVisible } = useFocusRing()

    return (
      <StyledIconButton
        {...props}
        data-testid={`btn-${testId}`}
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
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
