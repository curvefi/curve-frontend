import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { InputProvider } from '@ui/InputComp'

type DivProps = ComponentPropsWithRef<'div'>
type LabelProps = ComponentPropsWithRef<'label'>
type InputProviderComponentProps = ComponentProps<typeof InputProvider>

export const StyledInputProvider: IStyledComponent<'web', InputProviderComponentProps> = styled(InputProvider)`
  width: 100%;
  align-items: center;
  min-height: var(--height-x-large);
`

export const FlexItemAmount: IStyledComponent<'web', DivProps> = styled.div`
  flex: 1;
  height: 100%;
`

export const FlexItemMaxBtn: IStyledComponent<'web', DivProps> = styled.div`
  flex: 0 0 auto;
`

export const FlexItemToken: IStyledComponent<'web', DivProps> = styled.div`
  flex: 0 0 120px;
`

export const EpochLabel: IStyledComponent<'web', LabelProps> = styled.label`
  align-self: center;
  font-size: var(--font-size-2);
`

export const EpochInputWrapper: IStyledComponent<'web', DivProps> = styled.div`
  width: 30%;
`

export const StepperContainer: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
