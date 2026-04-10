import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type DivProps = ComponentPropsWithRef<'div'>

export const StyledDetailInfoWrapper: IStyledComponent<'web', DivProps> = styled.div`
  margin-top: 0.375rem; // 6px
`
