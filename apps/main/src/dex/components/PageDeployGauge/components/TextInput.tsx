import { useRef } from 'react'
import type { AriaTextFieldProps } from 'react-aria'
import { useTextField } from 'react-aria'
import { styled } from 'styled-components'
import { InputProvider } from '@ui/InputComp'

interface Props extends AriaTextFieldProps {
  label: string
}

export const TextInput = (props: Props) => {
  const ref = useRef(null)
  const { inputProps } = useTextField(props, ref)

  return (
    <InputProvider grid id="sidechainLpTokenAddress">
      <Label>{props.label}</Label>
      <StyledInput {...inputProps} ref={ref} />
    </InputProvider>
  )
}

const Label = styled.span`
  font-size: var(--font-size-1);
`

const StyledInput = styled.input`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--input--font-size);
  background-color: var(--input--background-color);
  color: var(--input--color);
  &:focus,
  &:focus:not(.focus-visible) {
    outline: none;
  }
`
