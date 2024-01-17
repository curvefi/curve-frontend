import type { ButtonProps } from 'ui/src/Button/types'

import React from 'react'
import styled from 'styled-components'

import { useInputContext } from './InputProvider'
import Box from 'ui/src/Box'
import Button from 'ui/src/Button'

const InputMaxBtn = ({
  className,
  disabled,
  isNetworkToken,
  testId,
  onClick,
  ...props
}: ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean
    className?: string
    isNetworkToken?: boolean
    testId?: string
    onClick: () => void
  }) => {
  const { disabled: globalDisabled } = useInputContext()

  return (
    <Box flex flexAlignItems="center">
      <StyledButton
        {...props}
        onClick={onClick}
        data-testid={testId}
        className={className}
        variant="filled"
        {...(globalDisabled || disabled ? { disabled: true } : {})}
        {...(isNetworkToken ? { title: 'Balance minus estimated gas' } : {})}
      >
        MAX{isNetworkToken ? '*' : ''}
      </StyledButton>
    </Box>
  )
}

const StyledButton = styled(Button)<ButtonProps>`
  padding: var(--spacing-1);
  font-size: var(--font-size-2);
`

InputMaxBtn.displayName = 'InputMaxBtn'

export default InputMaxBtn
