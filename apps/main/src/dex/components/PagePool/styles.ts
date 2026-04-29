import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type DivProps = ComponentPropsWithRef<'div'>

export const FieldsWrapper: IStyledComponent<'web', DivProps> = styled.div`
  display: grid;
  width: 100%;

  row-gap: 0.5rem;
`
