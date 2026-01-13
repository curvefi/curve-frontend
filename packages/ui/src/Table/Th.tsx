import { styled } from 'styled-components'
import { breakpoints } from 'ui/src/utils'

export const Th = styled.th<{ $first?: boolean; $last?: boolean }>`
  padding: var(--spacing-1) var(--spacing-2);
  height: 1px;

  ${({ $first }) => $first && `padding-left: var(--spacing-narrow);`};
  ${({ $last }) => $last && `padding-right: var(--spacing-narrow);`};

  @media (min-width: ${breakpoints.sm}rem) {
    ${({ $first }) => $first && `padding-left: var(--spacing-normal);`};
    ${({ $last }) => $last && `padding-right: var(--spacing-normal);`};
  }
`
