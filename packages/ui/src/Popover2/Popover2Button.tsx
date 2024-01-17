// @ts-nocheck
import { useButton } from 'react-aria'
import * as React from 'react'
import styled from 'styled-components'

import { buttonOutlinedStyles } from 'ui/src/Button/styles'
import { focusVisible } from 'ui/src/utils/sharedStyles'

export type ButtonVariant = 'outlined'

function Popover2Button({ buttonVariant, ...props }) {
  let ref = props.buttonRef
  let { buttonProps } = useButton(props, ref)

  return (
    <Button {...buttonProps} variant={buttonVariant} ref={ref} style={props.buttonStyles}>
      {props.children}
    </Button>
  )
}

const Button = styled.button<{ variant?: ButtonVariant }>`
  ${focusVisible};

  background-color: var(--popover-button--background-color);
  color: inherit;
  line-height: 1;
  min-width: 24px;
  min-height: 24px;
  padding: 0.5rem 0 0.2rem 0.5rem;

  :hover:not(:disabled) {
    color: var(--primary-400);
    cursor: pointer;
  }

  :disabled {
    opacity: 0.7;
  }

  ${({ variant }) => {
    if (variant === 'outlined') {
      return `${buttonOutlinedStyles};`
    }
  }}
`

export default Popover2Button
