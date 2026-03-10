import type { ComponentPropsWithRef } from 'react'
import { forwardRef, ButtonHTMLAttributes, useRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { useFocusRing } from '@react-aria/focus'
import { Box } from '@ui/Box/Box'
import type { ButtonProps } from '@ui/Button/types'
import { Spinner } from '@ui/Spinner/Spinner'
import { buttonBaseStyles } from './styles'

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
      className?: string
      testId?: string
    }
>(({ className, children, loading, testId, ...props }, ref) => {
  const buttonRef = useRef(null)
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

export const StyledButton: IStyledComponent<'web', ButtonProps & ComponentPropsWithRef<'button'>> =
  styled.button<ButtonProps>`
    ${buttonBaseStyles};
  `

const BoxSpinner = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  background-color: var(--button--disabled_spinner--background-color);
`

Button.displayName = 'Button'
