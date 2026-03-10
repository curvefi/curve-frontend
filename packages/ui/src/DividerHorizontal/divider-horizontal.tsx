import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const DividerHorizontal: IStyledComponent<'web', ComponentPropsWithRef<'div'>> = styled.div`
  border-left: 2px solid var(--page--text-color);
  padding: var(--spacing-2) 0;
  opacity: 0.3;
`
