import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type H2Props = ComponentPropsWithRef<'h2'>

export const Title: IStyledComponent<'web', H2Props> = styled.h2`
  font-family: var(--button--font);
  font-size: var(--font-size-3);
  margin-bottom: 0.25rem;
`
