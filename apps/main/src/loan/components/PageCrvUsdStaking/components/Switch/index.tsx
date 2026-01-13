import { useRef } from 'react'
import type { AriaSwitchProps } from 'react-aria'
import { useFocusRing, useSwitch, VisuallyHidden } from 'react-aria'
import { useToggleState } from 'react-stately'
import { styled } from 'styled-components'

interface Props extends AriaSwitchProps {
  isActive: boolean
}

export function Switch({ isActive, ...props }: Props) {
  const state = useToggleState({ ...props })
  const ref = useRef(null)
  const { inputProps } = useSwitch({ ...props, 'aria-label': 'Toggle switch' }, state, ref)
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <StyledSwitch>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      {props.children && <Title>{props.children}</Title>}
      <svg width={32} height={20} aria-hidden="true">
        <rect
          x={2}
          y={2}
          width={28}
          height={16}
          fill={isActive ? 'var(--dropdown--active--background-color)' : 'gray'}
        />
        <rect x={state.isSelected ? 16 : 4} y={4} width={12} height={12} fill="white" />
        {isFocusVisible && (
          <rect
            x={1}
            y={1}
            width={30}
            height={18}
            fill="none"
            stroke="var(--button_text--hover--color)"
            strokeWidth={2}
          />
        )}
      </svg>
    </StyledSwitch>
  )
}

const StyledSwitch = styled.label`
  display: flex;
  align-content: center;
  svg {
    transition:
      background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    cursor: pointer;
  }
`

const Title = styled.p`
  font-weight: var(--bold);
  margin-right: var(--spacing-1);
  margin-top: 0.2rem;
  color: var(--box--primary--color);
`
