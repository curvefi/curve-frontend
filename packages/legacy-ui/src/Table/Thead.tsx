import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const Thead: IStyledComponent<'web', ComponentPropsWithRef<'thead'>> = styled.thead`
  border-bottom: 1px solid var(--border-400);
`
