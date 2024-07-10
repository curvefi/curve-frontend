import styled from 'styled-components'

import Box from 'ui/src/Box/Box'
import Loader from 'ui/src/Loader/Loader'

interface Props {
  loading: boolean
  title: string
  data: React.ReactNode
  className?: string
}

const TitleColumnDataComp: React.FC<Props> = ({ loading, title, data, className }) => {
  return (
    <Wrapper className={className}>
      <SubTitle>{title}</SubTitle>
      {loading ? <Loader isLightBg skeleton={[56, 16.5]} /> : data}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
`

export const SubTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
  &.align-right {
    @media (min-width: 32.5rem) {
      text-align: right;
    }
  }
`

export const SubTitleColumnData = styled.h3`
  font-size: var(--font-size-2);
`

export default TitleColumnDataComp
