import { ReactNode } from 'react'
import { styled } from 'styled-components'

type SmallLabelProps = {
  description: ReactNode
  isKilled?: boolean
  isNetwork?: boolean
  className?: string
}

export const SmallLabel = ({ description, isKilled, className, isNetwork }: SmallLabelProps) => (
  <BoxedData isKilled={!!isKilled} isNetwork={isNetwork} className={className}>
    {description}
  </BoxedData>
)

const BoxedData = styled.span<{ isKilled?: boolean; isNetwork?: boolean }>`
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
  border: 1px solid var(--gray-500);
  border-radius: 0.75rem;
  color: inherit;
  @media (min-width: 33.125rem) {
    margin: 0;
  }
  ${({ isKilled }) =>
    isKilled &&
    `
      color: var(--chart-red);
      border: 1px solid var(--chart-red);
    `}

  ${({ isNetwork }) =>
    isNetwork &&
    `
      color: var(--primary-400);
      border: 1px solid var(--primary-400);
    `}
`
