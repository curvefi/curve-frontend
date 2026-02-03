import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const ListInfoItems: IStyledComponent<'web', ComponentPropsWithRef<'ul'>> = styled.ul`
  > li:not(:last-of-type) {
    margin-right: var(--spacing-wide);
  }
`
