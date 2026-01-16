import { ButtonHTMLAttributes, CSSProperties, RefObject } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import type { ButtonProps } from '@ui/Button/types'
import { StyledBtn } from '@ui/Select/styles'
import { Spinner } from '@ui/Spinner'
import { SpinnerWrapper } from '@ui/Spinner/SpinnerWrapper'

export const SelectBtn = ({
  loading,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  AriaButtonProps &
  ButtonProps & { buttonRef: RefObject<HTMLButtonElement | null>; style?: CSSProperties }) => {
  const { children, buttonRef } = props
  const { buttonProps } = useButton(props, buttonRef)

  return (
    <StyledBtn {...buttonProps} $loading={loading} ref={buttonRef} style={style}>
      {loading && (
        <StyledSpinnerWrapper>
          <Spinner isDisabled size={17} />
        </StyledSpinnerWrapper>
      )}
      {children}
    </StyledBtn>
  )
}

SelectBtn.displayName = 'SelectBtn'

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: 0;
  position: absolute;
  width: calc(100% - 0.75rem); // 0.75 = StyledBtn padding
`
