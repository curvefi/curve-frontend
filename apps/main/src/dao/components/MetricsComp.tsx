import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Box } from '@ui/Box/Box'
import { Loader } from '@ui/Loader/Loader'

interface Props {
  loading?: boolean
  title: string
  data: ReactNode
  className?: string
  row?: boolean
}

export const MetricsComp = ({ loading = false, title, data, className, row = false }: Props) => (
  <Wrapper className={className} row={row}>
    <MetricsTitle row={row}>{title}</MetricsTitle>
    {loading ? <StyledLoader isLightBg skeleton={[56, 16.5]} row={row} /> : data}
  </Wrapper>
)

const Wrapper = styled(Box)<{ row?: boolean }>`
  display: flex;
  flex-direction: ${({ row }) => (row ? 'row' : 'column')};
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  justify-content: space-between;
`

const StyledLoader = styled(Loader)<{ row?: boolean }>`
  margin-top: ${({ row }) => (row ? '0' : 'var(--spacing-1)')};
  margin-left: ${({ row }) => (row ? 'var(--spacing-2)' : '0')};
`

export const MetricsTitle = styled.p<{ row?: boolean }>`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
  ${({ row }) => (row ? 'align-self: flex-end' : '')};
  &.align-right {
    @media (min-width: 32.5rem) {
      text-align: right;
    }
  }
`

export const MetricsColumnData = styled.h3<{ noMargin?: boolean; capitalize?: boolean }>`
  margin-top: ${({ noMargin }) => (noMargin ? '0' : 'var(--spacing-1)')};
  font-size: var(--font-size-2);
  text-transform: ${({ capitalize }) => (capitalize ? 'capitalize' : 'none')};
`
