import { keyframes, styled } from '@mui/material/styles'
import { createSvgIcon } from '@mui/material/utils'

const swingLeft = keyframes`
  0% {
    transform: rotate(0deg);
    animation-timing-function: ease-out;
  }
  25% {
    transform: rotate(50deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(0deg);
    animation-timing-function: linear;
  }
`

const swingRight = keyframes`
  0% {
    transform: rotate(0deg);
    animation-timing-function: linear;
  }
  50% {
    transform: rotate(0deg);
    animation-timing-function: ease-out;
  }
  75% {
    transform: rotate(-50deg);
    animation-timing-function: ease-in;
  }
`

export const NewtonCradleIcon = styled(
  createSvgIcon(
    <svg fill="currentColor" viewBox="0 -10 40 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="12" r="3" />
      <circle cx="16" cy="12" r="3" />
      <circle cx="24" cy="12" r="3" />
      <circle cx="32" cy="12" r="3" />
    </svg>,
    'NewtonCradle',
  ),
)({
  '& > circle': { transformOrigin: 'center top' },
  '& > circle:first-of-type': { animation: `${swingLeft} 1.2s linear infinite` },
  '& > circle:last-of-type': { animation: `${swingRight} 1.2s linear infinite` },
})
