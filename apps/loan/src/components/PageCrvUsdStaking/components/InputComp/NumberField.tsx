import type { AriaNumberFieldProps } from 'react-aria'

import { useRef } from 'react'
import styled from 'styled-components'
import { useNumberFieldState } from 'react-stately'
import { useLocale, useNumberField } from 'react-aria'

interface Props extends AriaNumberFieldProps {
  className?: string
}

const NumberField = (props: Props) => {
  const { label, minValue = 0, maxValue = Infinity, defaultValue = 0 } = props
  const { locale } = useLocale()
  const state = useNumberFieldState({ ...props, locale, minValue, maxValue, defaultValue })
  const inputRef = useRef(null)
  const { labelProps, groupProps, inputProps } = useNumberField(props, state, inputRef)

  return <StyledInput {...inputProps} ref={inputRef} />
}

const StyledInput = styled.input`
  padding: var(--spacing-1) var(--spacing-1);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-3);
  color: var(--page--text-color);
  cursor: pointer;
  background-color: transparent;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  :focus-visible {
    outline: var(--button_text--hover--color) auto 2px;
  }
`

export default NumberField
