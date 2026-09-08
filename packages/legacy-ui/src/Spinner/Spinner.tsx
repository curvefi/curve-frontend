import { styled, keyframes } from 'styled-components'

type SpinnerProps = {
  className?: string
  isDisabled?: boolean
  size?: number
}

export const Spinner = ({ isDisabled = false, size, ...props }: SpinnerProps) => (
  <StyledSpinner {...props} isDisabled={isDisabled} size={size}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </StyledSpinner>
)

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

type StyledSpinnerProps = {
  isDisabled: boolean
  size?: number
}

const StyledSpinner = styled.div<StyledSpinnerProps>`
  display: inline-block;
  position: relative;
  width: ${({ size }) => (size || 30) + 4}px;
  height: ${({ size }) => (size || 30) + 4}px;

  div {
    display: block;
    position: absolute;
    width: ${({ size }) => size || 30}px;
    height: ${({ size }) => size || 30}px;
    margin: 2px;
    border: 2px solid ${({ isDisabled }) => getSpinnerColor(isDisabled)};

    border-radius: 50%;
    animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: ${({ isDisabled }) => getSpinnerColor(isDisabled)} transparent transparent transparent;
  }

  div:nth-of-type(1) {
    animation-delay: -0.45s;
  }
  div:nth-of-type(2) {
    animation-delay: -0.3s;
  }
  div:nth-of-type(3) {
    animation-delay: -0.15s;
  }
`

function getSpinnerColor(isDisabled: boolean) {
  if (isDisabled) {
    return 'var(--input--disabled--color)'
  } else {
    return 'var(--spinner--background-color)'
  }
}
