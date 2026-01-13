import { useRef } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import { Button as ButtonComp } from '@ui/Button'
import type { ButtonProps } from '@ui/Button/types'

export const ComboBoxSelectedGaugeButton = (props: AriaButtonProps<'button'> & ButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const { children, onPress, ...rest } = props

  return (
    <StyledButtonComp variant={props.variant} {...buttonProps} {...rest} ref={ref}>
      {children}
    </StyledButtonComp>
  )
}

const StyledButtonComp = styled(ButtonComp)`
  padding: var(--spacing-2) var(--spacing-4);
`
