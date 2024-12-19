import type { Dispatch, SetStateAction } from 'react'
import type { BoxProps } from 'ui/src/Box/types'

import type { InputMinHeight, InputVariant } from './types'

import React, { createContext, useContext, useState } from 'react'
import styled from 'styled-components'

import { focusVisible } from 'ui/src/utils/sharedStyles'
import Box from 'ui/src/Box/Box'

export interface InputProviderProps extends Omit<BoxProps, 'padding'> {
  disabled?: boolean
  id: string
  inputVariant?: InputVariant | ''
  minHeight?: InputMinHeight
  padding?: string
}

interface InputContextProps extends Pick<InputProviderProps, 'disabled' | 'id' | 'inputVariant'> {
  setIsFocusVisible: Dispatch<SetStateAction<boolean>>
}

const InputContext = createContext<InputContextProps>(undefined!)

const InputProvider = ({
  className,
  children,
  disabled,
  id,
  inputVariant,
  ...boxProps
}: React.PropsWithChildren<InputProviderProps>) => {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  return (
    <InputContext.Provider value={{ disabled, id, inputVariant, setIsFocusVisible }}>
      <InputWrapper
        flex
        gridColumnGap={2}
        {...boxProps}
        className={`${className || ''} ${isFocusVisible ? 'focus-visible' : ''}`}
        disabled={disabled}
        inputVariant={inputVariant}
        minHeight={inputVariant === 'small' ? 'medium' : 'x-large'}
      >
        {children}
      </InputWrapper>
    </InputContext.Provider>
  )
}

interface InputWrapperProps {
  disabled?: boolean
  padding?: string
  inputVariant?: InputVariant | ''
  minHeight?: InputMinHeight
}

export const InputWrapper = styled(Box)<InputWrapperProps>`
  ${focusVisible};

  min-height: ${({ minHeight }) => `var(--height-${minHeight || 'x-large'})`};
  padding: ${({ padding }) => padding || `var(--spacing-1) var(--spacing-1) var(--spacing-1) var(--spacing-2)`};
  position: relative;

  color: var(--input--color);
  background-color: var(--input--background-color);
  border: 1px solid var(--input--border-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--input--border-color);

  /* || MODIFIERS */
  ${({ disabled }) => {
    if (disabled) {
      return `
        color: var(--input--disabled--color);
      `
    }
  }}

  ${({ inputVariant }) => {
    if (inputVariant === 'warning') {
      return `
        border-color: var(--warning-400);
        box-shadow: inset 0.5px 0.5px 0px 0.5px var(--warning-400);
      `
    } else if (inputVariant === 'error') {
      return `
        border-color: var(--danger-400);
        box-shadow: inset 0.5px 0.5px 0px 0.5px var(--danger-400);
      `
    }
  }}
`

InputProvider.displayName = 'InputProvider'

export default InputProvider

export function useInputContext() {
  return useContext(InputContext)
}
