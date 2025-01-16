import type { AriaButtonProps } from 'react-aria'
import type { ButtonProps } from '@/ui/Button/types'

import { useButton } from 'react-aria'
import React, { useRef } from 'react'
import styled from 'styled-components'

import ButtonComp from '@/ui/Button'

const ComboBoxSelectedTokenButton = (props: React.PropsWithChildren<AriaButtonProps<'button'> & ButtonProps>) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const { children, onPress, ...rest } = props

  return (
    <StyledComboBoxButton {...buttonProps} {...rest} ref={ref}>
      {children}
    </StyledComboBoxButton>
  )
}

const StyledComboBoxButton = styled(ButtonComp)`
  align-items: center;
  display: grid;
  padding-right: var(--spacing-2);
  height: 100%;

  text-transform: var(--input_button--text-transform);

  color: var(--input_button--color);
  background-color: var(--input--background-color);
  border: 0.5px solid var(--input_button--border-color);
  box-shadow: inset -2px -2px 0px 0.25px var(--box--primary--shadow-color);

  grid-template-columns: auto 1fr auto;

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  :disabled {
    opacity: 0.7;
  }

  :hover:not(:disabled) {
    color: var(--input_button--hover--color);
    background-color: var(--input_button--hover--background-color);
  }
`

export default ComboBoxSelectedTokenButton
