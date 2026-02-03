import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type TbodyProps = { $borderBottom?: boolean }

export const Tbody: IStyledComponent<'web', TbodyProps & ComponentPropsWithRef<'tbody'>> = styled.tbody<TbodyProps>`
  ${({ $borderBottom }) => $borderBottom && `border-bottom: 1px solid var(--border-400);`};
`
