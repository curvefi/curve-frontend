import { styled } from 'styled-components'
import { InputProvider } from '@ui/InputComp'

export const StyledInputProvider = styled(InputProvider)`
  width: 100%;
  align-items: center;
  min-height: var(--height-x-large);
`

export const FlexItemAmount = styled.div`
  flex: 1;
  height: 100%;
`

export const FlexItemMaxBtn = styled.div`
  flex: 0 0 auto;
`

export const FlexItemToken = styled.div`
  flex: 0 0 120px;
`

export const EpochLabel = styled.label`
  align-self: center;
  font-size: var(--font-size-2);
`

export const EpochInputWrapper = styled.div`
  width: 30%;
`

export const StepperContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
