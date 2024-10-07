
import { useFocusRing } from '@react-aria/focus'
import * as React from 'react'
import styled from 'styled-components'

import Box from 'ui/src/Box/Box'
import type { ButtonProps } from 'ui/src/Button/types'
import Spinner from 'ui/src/Spinner/Spinner'
import { buttonBaseStyles } from './styles'

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      className?: string
      testId?: string
    }
>(({ className, children, loading, testId, ...props }, ref) => {
  const buttonRef = React.useRef(null)
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <StyledButton
      {...props}
      {...focusProps}
      data-testid={`btn-${testId}`}
      className={`${className || ''} ${loading ? 'loading' : ''} ${isFocusVisible ? 'focus-visible' : ''}`}
      ref={ref || buttonRef}
    >
      {children}
      {loading && (
        <BoxSpinner flex flexAlignItems="center" flexJustifyContent="center" fillWidth fillHeight>
          <Spinner isDisabled size={17} />
        </BoxSpinner>
      )}
    </StyledButton>
  )
})

export const StyledButton = styled.button<ButtonProps>`
  ${buttonBaseStyles};
`

const BoxSpinner = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;

  background-color: var(--button--disabled_spinner--background-color);
`

Button.displayName = 'Button'

export default Button
