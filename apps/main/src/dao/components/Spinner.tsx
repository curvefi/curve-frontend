import styled from 'styled-components'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'

interface SpinnnerProps {
  height: string
}

const SpinnerComponent = ({ height }: SpinnnerProps) => (
  <StyledSpinnerWrapper height={height}>
    <Spinner />
  </StyledSpinnerWrapper>
)

const StyledSpinnerWrapper = styled(SpinnerWrapper)<SpinnnerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${({ height }) => height};
`

export default SpinnerComponent
