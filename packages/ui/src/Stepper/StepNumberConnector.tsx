import { styled, css } from 'styled-components'
import { statusColorMap } from './helpers'
import type { StepStatus } from './types'

type StepNumberConnector = {
  visible: boolean
  status: StepStatus
  nextStatus?: StepStatus
  direction: 'up' | 'down'
}

export const StepNumberConnector = styled.div<StepNumberConnector>`
  width: 5px;
  flex-grow: 1;
  margin-right: 20px;
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  transition: all 0.5s ease;

  ${(props) =>
    props.direction === 'down'
      ? css`
          background: linear-gradient(
            180deg,
            ${statusColorMap(props.status)} 0%,
            ${statusColorMap(props.status)} 50%,
            ${statusColorMap(props.nextStatus)} 100%
          );
        `
      : css`
          background-color: ${statusColorMap(props.status)};
        `}

  ${({ status }) => {
    if (status === 'pending') {
      return `
        box-shadow: none;
        border: 1px solid var(--button--disabled--background-color);
        border-bottom: none;
        border-top: none;
        z-index: var(--z-index-stepper);
      `
    }
  }}
`
