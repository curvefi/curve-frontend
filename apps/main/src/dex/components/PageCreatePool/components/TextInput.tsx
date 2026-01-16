import { ReactNode, useRef } from 'react'
import type { AriaTextFieldProps } from 'react-aria'
import { useTextField } from 'react-aria'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'

interface Props extends AriaTextFieldProps {
  row?: boolean
}

export const TextInput = (props: Props) => {
  const { label } = props
  const ref = useRef(null)
  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(props, ref)

  return (
    <InputWrapper isRow={props.row !== undefined} flex flexColumn>
      <label {...labelProps}>{label}</label>
      <StyledInput {...inputProps} ref={ref} />
      {props.description && <div {...descriptionProps}>{props.description}</div>}
      {props.errorMessage && <ErrorMessage {...errorMessageProps}>{props.errorMessage as ReactNode}</ErrorMessage>}
    </InputWrapper>
  )
}

const InputWrapper = styled(Box)<{ isRow: boolean }>`
  label {
    margin: var(--spacing-narrow) var(--spacing-2) var(--spacing-2);
    color: var(--box--primary--color);
    font-size: var(--font-size-2);
  }
  @media (min-width: 31.25rem) {
    width: ${({ isRow }) => (isRow ? '100%' : 'calc(50% - var(--spacing-narrow))')};
  }
`

const StyledInput = styled.input`
  padding: var(--spacing-2) var(--spacing-narrow);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  color: var(--page--text-color);
  border: 1px solid var(--page--text-color);
  background-color: var(--dialog--background-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--input--border-color);
  cursor: pointer;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  &:focus-visible {
    outline: var(--button_text--hover--color) auto 2px;
  }
`

const ErrorMessage = styled.div`
  margin-top: var(--spacing-1);
  padding: 0 var(--spacing-2);
  color: var(--danger-400);
  font-size: var(--font-size-1);
  font-weight: var(--medium);
`
