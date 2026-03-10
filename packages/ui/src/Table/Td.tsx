import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { breakpoints } from '@ui/utils'

type TdProps = { $first?: boolean; $last?: boolean }

export const Td: IStyledComponent<'web', TdProps & ComponentPropsWithRef<'td'>> = styled.td<TdProps>`
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
