import { styled } from 'styled-components'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'

interface SpinnnerProps {
  height: string
}

export const SpinnerComponent = ({ height }: SpinnnerProps) => (
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
