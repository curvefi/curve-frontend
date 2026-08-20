import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { breakpoints } from '@ui/utils'

type ThProps = { $first?: boolean; $last?: boolean }

export const Th: IStyledComponent<'web', ThProps & ComponentPropsWithRef<'th'>> = styled.th<ThProps>`
  padding: var(--spacing-1) var(--spacing-2);
  height: 1px;

  ${({ $first }) => $first && `padding-left: var(--spacing-narrow);`};
  ${({ $last }) => $last && `padding-right: var(--spacing-narrow);`};

  @media (min-width: ${breakpoints.sm}rem) {
    ${({ $first }) => $first && `padding-left: var(--spacing-normal);`};
    ${({ $last }) => $last && `padding-right: var(--spacing-normal);`};
  }
`
