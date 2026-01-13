import { useRef } from 'react'
import type { AriaSwitchProps } from 'react-aria'
import { useFocusRing, useSwitch, VisuallyHidden } from 'react-aria'
import { useToggleState } from 'react-stately'
import { styled } from 'styled-components'

interface Props extends AriaSwitchProps {
  isActive: boolean
}

export function Switch({ isActive, ...props }: Props) {
  const state = useToggleState(props)
  const ref = useRef(null)
  const { inputProps } = useSwitch(props, state, ref)
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <StyledSwitch>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <Title>{props.children}</Title>
      <svg width={40} height={24} aria-hidden="true">
        <rect
          x={4}
          y={4}
          width={32}
          height={16}
          rx={8}
          fill={!isActive ? 'var(--dropdown--active--background-color)' : 'gray'}
        />
        <circle cx={state.isSelected ? 28 : 12} cy={12} r={5} fill="white" />
        {isFocusVisible && (
          <rect
            x={1}
            y={1}
            width={38}
            height={22}
            rx={11}
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
