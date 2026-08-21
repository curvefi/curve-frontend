import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type DivProps = ComponentPropsWithRef<'div'>

export const FlexContainer: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  gap: var(--spacing-3);
  align-content: center;
  justify-content: space-between;
`

export const GroupedFieldsContainer: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const FormFieldsContainer: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`

export const ErrorContainer: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  width: 100%;
`

export const FormContainer: IStyledComponent<'web', DivProps> = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  width: 100%;
`
