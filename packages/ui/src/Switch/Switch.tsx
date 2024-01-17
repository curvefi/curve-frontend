import styled, { keyframes } from 'styled-components'
import { ToggleProps, useToggleState } from 'react-stately'
import { useRef } from 'react'
import { useFocusRing, useSwitch, VisuallyHidden } from 'react-aria'

interface Props extends ToggleProps {
  className?: string
  isDarkBg?: boolean
}

function Switch(props: Props) {
  let ref = useRef<HTMLInputElement>(null)
  let state = useToggleState(props)
  let { inputProps } = useSwitch(props, state, ref)
  let { isFocusVisible, focusProps } = useFocusRing()

  return (
    <SwitchLabel className={props.className} isDisabled={props.isDisabled}>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <SwitchBtn
        width={54}
        height={30}
        aria-hidden="true"
        isDarkBg={props.isDarkBg}
        className={state.isSelected ? 'isActive' : 'isInActive'}
      >
        <SwitchBtnBase x={1} y={1} width={46} height={26} />
        <SwitchBtnThumb y={5} width={18} height={18} />
        {isFocusVisible && <FocusRing x={1} y={1} width={46} height={26} fill="none" />}
      </SwitchBtn>
      {props.children}
    </SwitchLabel>
  )
}

Switch.defaultProps = {
  className: '',
}

const FocusRing = styled.rect`
  stroke: var(--focus);
  stroke-width: 2;
`

const moveLeft = keyframes`
  from {
    transform: translateX(4px);
  }
  to {
    transform: translateX(24px);
  }
`
const moveRight = keyframes`
  from {
    transform: translateX(24px);
  }
  to {
    transform: translateX(5px);
  }
`

const SwitchBtnBase = styled.rect`
  fill: var(--switch--background-color);
  stroke-width: 1px;
  stroke: var(--swtich--border-color);
`

const SwitchBtnThumb = styled.rect`
  fill: var(--switch-thumb--background-color);
`

const SwitchBtn = styled.svg<{ isDarkBg?: boolean }>`
  margin-right: 0.25rem;

  &.isActive {
    ${SwitchBtnBase} {
      fill: ${({ isDarkBg }) =>
        isDarkBg ? `var(--switch--active--darkBg-background-color)` : `var(--switch--active--background-color)`};
    }

    ${SwitchBtnThumb} {
      animation: ${moveLeft} 0.25s forwards;
    }
  }

  &.isInActive {
    ${SwitchBtnThumb} {
      animation: ${moveRight} 0.25s forwards;
    }
  }
`

const SwitchLabel = styled.label<{ isDisabled?: boolean }>`
  align-items: center;
  cursor: pointer;
  display: flex;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.4 : 1)};
`

export default Switch
