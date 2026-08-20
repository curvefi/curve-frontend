import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const BoxHeader: IStyledComponent<'web', ComponentPropsWithRef<'header'>> = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-1);
  min-height: var(--box_header--height);
  width: 100%;

  color: var(--box_header--primary--color);
  background-color: var(--box_header--primary--background-color);

  font-size: var(--box_header--font-size);
  font-weight: var(--box_header--font-weight);
`
