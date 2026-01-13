import { useMemo } from 'react'
import { styled } from 'styled-components'
import { Icon } from '@ui/Icon/Icon'
import { useInputContext } from './InputContext'
import type { InputVariant } from './types'

export interface InputMessageProps {
  message?: string
}

export const InputMessage = ({ message }: InputMessageProps) => {
  const { inputVariant } = useInputContext() ?? {}

  const IconComp = useMemo(() => {
    if (inputVariant === 'error') {
      return <Icon name="Misuse" size={20} />
    } else if (inputVariant === 'warning') {
      return <Icon name="WarningSquareFilled" size={20} />
    }
    return null
  }, [inputVariant])

  return (
    <Message inputVariant={inputVariant}>
      {IconComp}
      <Content>{message}</Content>
    </Message>
  )
}

const Content = styled.span`
  margin-left: var(--spacing-1);
  white-space: nowrap;
  text-overflow: ellipsis;
`

const Message = styled.div<{
  inputVariant?: InputVariant | ''
}>`
  align-items: center;
  display: inline-flex;
  justify-content: flex-end;

  height: 80%;
  margin: var(--spacing-1);
  max-width: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;

  background: var(--input--background-color);

  font-size: var(--font-size-4);
  white-space: nowrap;

  ${({ inputVariant }) => {
    if (inputVariant === 'warning') {
      return `
        color: var(--warning-400);
       `
    } else if (inputVariant === 'error') {
      return `
        color: var(--danger-400);
      `
    }
  }}
`

InputMessage.displayName = 'InputMessage'
