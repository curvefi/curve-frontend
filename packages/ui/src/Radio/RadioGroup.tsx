import { ReactNode } from 'react'
import type { AriaRadioGroupProps } from 'react-aria'
import { useRadioGroup } from 'react-aria'
import type { RadioGroupProps } from 'react-stately'
import { useRadioGroupState } from 'react-stately'
import { styled, css } from 'styled-components'
import { mediaQueries } from '../utils/responsive'
import { RadioContext } from './RadioContext'

export const RadioGroup = ({
  children,
  className,
  testId,
  ...props
}: RadioGroupProps &
  AriaRadioGroupProps & {
    children: ReactNode
    className?: string
    testId?: string
  }) => {
  const state = useRadioGroupState(props)
  const { radioGroupProps } = useRadioGroup(props, state)

  return (
    <RadioGroupContainer data-testid={`radio-group-${testId}`} {...radioGroupProps} className={className}>
      <RadioContext value={state}>{children}</RadioContext>
    </RadioGroupContainer>
  )
}

const RadioGroupContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${mediaQueries('md')(css`
    display: grid;
    column-gap: 10px;
  `)}
`
