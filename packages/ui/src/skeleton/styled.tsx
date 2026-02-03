import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const LoaderWrapper: IStyledComponent<'web', ComponentPropsWithRef<'div'>> = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 8px;
`
