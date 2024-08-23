import styled from 'styled-components'

import Box from 'ui/src/Box/Box'
import Loader from 'ui/src/Loader/Loader'

interface Props {
  loading: boolean
  title: string
  data: React.ReactNode
  className?: string
}

const MetricsComp: React.FC<Props> = ({ loading, title, data, className }) => {
  return (
    <Wrapper className={className}>
      <MetricsTitle>{title}</MetricsTitle>
      {loading ? <Loader isLightBg skeleton={[56, 18]} /> : data}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
  justify-content: space-between;
`

export const MetricsTitle = styled.p`
  font-size: var(--font-size-1);
  opacity: 0.8;
  &.align-right {
    @media (min-width: 32.5rem) {
      text-align: right;
    }
  }
`

export const MetricsColumnData = styled.h3<{ noMargin?: boolean }>`
  margin-top: ${({ noMargin }) => (noMargin ? '0' : 'var(--spacing-1)')};
  font-size: var(--font-size-3);
`

export default MetricsComp
