import { CSSProperties, ReactNode, RefObject } from 'react'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import { AriaButtonOptions } from '@react-aria/button'
import { buttonOutlinedStyles } from 'ui/src/Button/styles'
import DividerHorizontal from 'ui/src/DividerHorizontal'
import SelectIconBtnDelete, { SelectIconBtnDeleteProps } from 'ui/src/Select/SelectIconBtnDelete'
import { focusVisible } from 'ui/src/utils/sharedStyles'

export type ButtonVariant = 'outlined'

export type Popover2ButtonProps = AriaButtonOptions<'button'> &
  SelectIconBtnDeleteProps & {
    buttonVariant?: ButtonVariant
    buttonRef: RefObject<HTMLButtonElement | null>
    buttonStyles?: CSSProperties
    children: ReactNode
  }

function Popover2Button({ buttonVariant, ...props }: Popover2ButtonProps) {
  const { loading, onSelectionDelete, buttonRef: ref, buttonStyles, children } = props
  const { buttonProps } = useButton(props, ref)
  return (
    <Wrapper variant={buttonVariant}>
      <Button {...buttonProps} variant={buttonVariant} ref={ref} style={buttonStyles}>
        {children}
      </Button>
      {onSelectionDelete && (
        <>
          <DividerHorizontal />
          <SelectIconBtnDelete loading={loading} onSelectionDelete={onSelectionDelete} />
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ variant?: ButtonVariant }>`
  align-items: center;
  display: inline-flex;

  ${({ variant }) => {
    if (variant === 'outlined') {
      return `${buttonOutlinedStyles};`
    }
  }}
`

const Button = styled.button<{ variant?: ButtonVariant }>`
  ${focusVisible};

  background-color: var(--popover-button--background-color);
  color: inherit;
  line-height: 1;
  min-width: 24px;
  min-height: 24px;
  padding: 0.5rem 0 0.2rem 0.5rem;

  &:hover:not(:disabled) {
    color: var(--primary-400);
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.7;
  }
`

export default Popover2Button
