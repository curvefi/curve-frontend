import { ReactNode } from 'react'
import { styled, css } from 'styled-components'
import { useRadioGroup } from '@react-aria/radio'
import { useRadioGroupState } from '@react-stately/radio'
import type { AriaRadioGroupProps, RadioGroupProps } from '@react-types/radio'
import { RadioContext } from 'ui/src/Radio'
import { mediaQueries } from 'ui/src/utils/responsive'

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
      <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
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
