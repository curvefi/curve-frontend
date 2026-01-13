import { styled } from 'styled-components'
import { breakpoints } from 'ui/src/utils'

export const Td = styled.td<{ $first?: boolean; $last?: boolean }>`
  padding: 0.5rem;

  &.border-right {
    border-right: 1px solid var(--border-400);
  }

  ${({ $first }) => $first && `padding-left: var(--spacing-narrow);`};
  ${({ $last }) => $last && `padding-right: var(--spacing-narrow);`};

  @media (min-width: ${breakpoints.sm}rem) {
    ${({ $first }) => $first && `padding-left: var(--spacing-normal);`};
    ${({ $last }) => $last && `padding-right: var(--spacing-normal);`};
  }
`
