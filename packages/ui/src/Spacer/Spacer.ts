import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const Spacer: IStyledComponent<'web', ComponentPropsWithRef<'div'>> = styled.div`
  flex-grow: 1;
`
