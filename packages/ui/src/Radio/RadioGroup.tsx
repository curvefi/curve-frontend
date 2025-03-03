import type { AriaRadioGroupProps, RadioGroupProps } from '@react-types/radio'

import styled, { css } from 'styled-components'
import { useRadioGroup } from '@react-aria/radio'
import { useRadioGroupState } from '@react-stately/radio'

import { mediaQueries } from 'ui/src/utils/responsive'
import { RadioContext } from 'ui/src/Radio'

const RadioGroup = ({
  children,
  className,
  testId,
  ...props
}: React.PropsWithChildren<
  RadioGroupProps &
    AriaRadioGroupProps & {
      className?: string
      testId?: string
    }
>) => {
  let state = useRadioGroupState(props)
  let { radioGroupProps } = useRadioGroup(props, state)

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

export default RadioGroup
