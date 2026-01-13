import { ButtonHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import { Box } from 'ui/src/Box'
import { Button } from 'ui/src/Button'
import type { ButtonProps } from 'ui/src/Button/types'
import { useInputContext } from './InputContext'

export const InputMaxBtn = ({
  className,
  disabled,
  isNetworkToken,
  testId,
  onClick,
  ...props
}: ButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
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
        testId={testId}
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
