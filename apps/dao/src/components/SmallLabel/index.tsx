import styled from 'styled-components'

type SmallLabelProps = {
  description: string
  isKilled?: boolean
  isNetwork?: boolean
  className?: string
}

const SmallLabel = ({ description, isKilled, className, isNetwork }: SmallLabelProps) => {
  return (
    <BoxedData isKilled={isKilled} isNetwork={isNetwork} className={className}>
      {description}
    </BoxedData>
  )
}

const BoxedData = styled.span<{ isKilled?: boolean; isNetwork?: boolean }>`
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  text-transform: capitalize;
  margin: auto 0 0;
  border: 1px solid var(--gray-500);
  border-radius: 0.75rem;
  color: inherit;
  @media (min-width: 33.125rem) {
    margin: 0;
  }
  ${({ isNetwork }) =>
    isNetwork &&
    `
      color: 'var(--chart-red)';
      border: 1px solid 'var(--chart-red)';
    `}

  ${({ isNetwork }) =>
    isNetwork &&
    `
      color: var(--primary-400);
      border: 1px solid var(--primary-400);
    `}
`

export default SmallLabel
