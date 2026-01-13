import { useRef } from 'react'
import { VisuallyHidden } from 'react-aria'
import { useToggleState } from 'react-stately'
import { styled } from 'styled-components'
import { useCheckbox } from '@react-aria/checkbox'
import { useFocusRing } from '@react-aria/focus'
import type { ToggleProps } from '@react-types/checkbox'

interface CheckboxProps extends ToggleProps {
  className?: string
  isDisabled?: boolean
  fillColor?: string
  blank?: boolean
}

export const Checkbox = ({ className, isDisabled = false, fillColor, blank, ...props }: CheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null)
  const state = useToggleState(props)
  const { inputProps } = useCheckbox(props, state, ref)
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <Label isDisabled={isDisabled} className={className}>
      <VisuallyHidden>
        <Input {...inputProps} {...focusProps} disabled={isDisabled} ref={ref} />
      </VisuallyHidden>
      <Svg width={24} height={24} aria-hidden="true">
        <Rect
          isSelected={state.isSelected}
          isDisabled={isDisabled}
          x={blank ? 6 : state.isSelected ? 4 : 5}
          y={blank ? 6 : state.isSelected ? 4 : 5}
          width={blank ? 12 : state.isSelected ? 16 : 14}
          height={blank ? 12 : state.isSelected ? 16 : 14}
          strokeWidth={2}
          fillColor={fillColor || ''}
        />
        {state.isSelected && (
          <path
            fill={blank ? fillColor : 'white'}
            transform="translate(7 7)"
            d={`M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1
            1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712
            6A.999.999 0 0 1 3.788 9z`}
          />
        )}
        {isFocusVisible && <FocusRect x={1} y={1} width={22} height={22} fill="none" strokeWidth={2} />}
      </Svg>
      {props.children}
    </Label>
  )
}

const Input = styled.input``

const Label = styled.label<{ isDisabled: boolean }>`
  display: flex;
  align-items: center;

  font-weight: var(--font-weight--bold);
  font-size: var(--font-size-2);
  color: inherit;

  cursor: pointer;

  ${({ isDisabled }) => {
    if (isDisabled) {
      return `
        cursor: inherit;
        opacity: 0.5;
      `
    }
  }}
`

const Svg = styled.svg`
  margin-right: 4px;
`

const Rect = styled.rect<{ isSelected: boolean; isDisabled: boolean; fillColor: string }>`
  ${({ isSelected, isDisabled, fillColor }) => {
    if (isSelected) {
      return `
        stroke: ${fillColor ? fillColor : 'var(--active--border-color)'};
        fill: ${fillColor ? fillColor : 'var(--checkbox--active--background-color)'};
      `
    } else if (isDisabled) {
      return `
        stroke: var(--checkbox--border-color);
        fill: var(--button--disabled--border-color);
      `
    } else {
      return `
        stroke: var(--checkbox--border-color);
        fill: var(--checkbox--background-color);
      `
    }
  }}
`

const FocusRect = styled.rect`
  stroke: var(--focus);
`

Checkbox.displayName = 'Checkbox'
