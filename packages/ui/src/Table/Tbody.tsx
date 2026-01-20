import { styled } from 'styled-components'

export const Tbody = styled.tbody<{ $borderBottom?: boolean }>`
  ${({ $borderBottom }) => $borderBottom && `border-bottom: 1px solid var(--border-400);`};
`
