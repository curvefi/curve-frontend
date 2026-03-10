import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

export const Table: IStyledComponent<'web', ComponentPropsWithRef<'table'>> = styled.table`
  width: 100%;
  border-collapse: collapse;
`

Table.displayName = 'Table'
