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
      {loading ? <StyledLoader isLightBg skeleton={[56, 18]} /> : data}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  justify-content: space-between;
`

const StyledLoader = styled(Loader)`
  margin-top: var(--spacing-1);
`

export const MetricsTitle = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
  &.align-right {
    @media (min-width: 32.5rem) {
      text-align: right;
    }
  }
`

export const MetricsColumnData = styled.h3<{ noMargin?: boolean }>`
  margin-top: ${({ noMargin }) => (noMargin ? '0' : 'var(--spacing-1)')};
  font-size: var(--font-size-2);
`

export default MetricsComp
