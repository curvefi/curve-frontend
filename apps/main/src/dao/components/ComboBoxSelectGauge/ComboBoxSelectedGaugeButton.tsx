import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import type { ButtonProps } from '@ui/Button/types'
import { useRef } from 'react'
import styled from 'styled-components'
import ButtonComp from '@ui/Button'

const ComboBoxSelectedGaugeButton = (props: AriaButtonProps<'button'> & ButtonProps) => {
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

export default ComboBoxSelectedGaugeButton
