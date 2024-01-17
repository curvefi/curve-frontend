import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils/responsive'

const TextEllipsis = styled.span<{
  maxWidth?: string
  smMaxWidth?: string
  mdMaxWidth?: string
  lgMaxWidth?: string
}>`
  display: inline-block;
  max-width: ${({ maxWidth }) => maxWidth || '8.125rem'}; // 130px
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: ${breakpoints.sm}rem) {
    max-width: ${({ smMaxWidth }) => smMaxWidth || '320px'};
  }

  @media (min-width: ${breakpoints.md}rem) {
    max-width: ${({ mdMaxWidth }) => mdMaxWidth || '768px;'};
  }

  @media (min-width: ${breakpoints.lg}rem) {
    max-width: ${({ lgMaxWidth }) => lgMaxWidth || '1024px'};
  }
`

export default TextEllipsis
