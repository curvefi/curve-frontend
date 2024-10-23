import type { AriaNumberFieldProps } from 'react-aria'

import styled from 'styled-components'

interface Props extends AriaNumberFieldProps {
  className?: string
}

const NumberField = (props: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    props.onChange && props.onChange(isNaN(value) ? 0 : value)
  }

  return <StyledInput value={props.value} isDisabled={props.isDisabled} onChange={handleChange} />
}

const StyledInput = styled.input<{ isDisabled?: boolean }>`
  padding: var(--spacing-1) var(--spacing-1);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-3);
  color: var(--page--text-color);
  cursor: ${({ isDisabled }) => (isDisabled ? 'cursor' : 'pointer')};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'pointer' : 'auto')};
  background-color: transparent;
  caret-color: ${({ isDisabled }) => (isDisabled ? 'transparent' : 'var(--page--text-color)')};
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  :focus-visible {
    outline: ${({ isDisabled }) => (isDisabled ? 'none' : 'var(--button_text--hover--color) auto 2px;')};
  }
`

export default NumberField
