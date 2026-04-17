import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { InternalLink } from '@ui/Link'
import type { InternalLinkProps } from '@ui/Link/InternalLink'

type TableRowWrapperProps = { columns: number; gridTemplateColumns?: string }
// eslint-disable-next-line react-refresh/only-export-components
export const TableRowWrapper: IStyledComponent<'web', TableRowWrapperProps & ComponentPropsWithRef<'div'>> =
  styled.div<TableRowWrapperProps>`
    display: grid;
    grid-template-columns: ${({ columns, gridTemplateColumns }) =>
      gridTemplateColumns ? gridTemplateColumns : `repeat(${columns}, 1fr)`};
    padding: var(--spacing-1) var(--spacing-3);
    border-bottom: 1px solid var(--gray-500a20);
    &:last-child {
      border-bottom: none;
    }
  `

// eslint-disable-next-line react-refresh/only-export-components
export const TableData: IStyledComponent<'web', ComponentPropsWithRef<'p'>> = styled.p`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1.5;
  display: flex;
  gap: var(--spacing-1);
  margin-left: auto;
  &.right-padding {
    padding-right: var(--spacing-2);
  }
  &.capitalize {
    text-transform: capitalize;
  }
  &.sortby-active {
    font-weight: var(--bold);
  }
  &.align-left {
    margin-right: auto;
    margin-left: 0;
    padding-left: var(--spacing-2);
  }
`

// eslint-disable-next-line react-refresh/only-export-components
export const TableDataLink: IStyledComponent<'web', InternalLinkProps> = styled(InternalLink)<InternalLinkProps>`
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  line-height: 1.5;
  display: flex;
  gap: var(--spacing-1);
  text-decoration: none;
  color: inherit;
  margin-left: auto;
  text-decoration: underline;
  &.right-padding {
    padding-right: var(--spacing-2);
  }
  &.capitalize {
    text-transform: capitalize;
  }
  &.sortby-active {
    font-weight: var(--bold);
  }
  &.align-left {
    margin-right: auto;
    margin-left: 0;
    padding-left: var(--spacing-2);
  }
`
