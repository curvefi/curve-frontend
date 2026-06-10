import { use, useRef } from 'react'
import type { AriaRadioProps } from 'react-aria'
import { useFocusRing, useRadio, VisuallyHidden } from 'react-aria'
import { styled } from 'styled-components'
import { Box } from '../Box'
import { RadioContext } from './RadioContext'

export const Radio = ({
  children,
  className,
  isCustom,
  testId,
  ...props
}: AriaRadioProps & {
  className?: string
  isCustom?: boolean // don't show radio icon if it is custom
  testId?: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const state = use(RadioContext)
  const { inputProps = {}, isSelected } = useRadio(props, state, inputRef)
  const { isFocusVisible, focusProps } = useFocusRing()
  const labelClassName = `${className} ${state.isDisabled ? 'disabled' : ''}`

  return (
    <Label data-testid={`radio-${testId}`} as="label" className={labelClassName} flex flexAlignItems="center">
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={inputRef} />
      </VisuallyHidden>

      {isCustom ? null : (
        <svg width={28} height={24} aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="var(--radio--border-color)" strokeWidth="2" />
          {isSelected ? (
            <circle
              cx="12"
              cy="12"
              r="6"
              fill="var(--radio--selected--background-color)"
              stroke="var(--radio--selected--background-color)"
              strokeWidth="2"
            />
          ) : (
            <circle cx="12" cy="12" r="6" fill="var(--white)" stroke="var(--white)" strokeWidth="2" />
          )}

          {isFocusVisible && (
            <circle cx={12} cy={12} r={11} fill="none" stroke="var(--radio--active--border-color)" strokeWidth={2} />
          )}
        </svg>
      )}

      {children}
    </Label>
  )
}

Radio.displayName = 'Radio'
const Label = styled(Box)`
  font-weight: 500;
  cursor: pointer;

  &.disabled {
    opacity: 0.5;
    cursor: initial;
  }
`
