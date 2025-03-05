import type { ButtonProps } from 'ui/src/Button/types'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import styled from 'styled-components'
import { StyledBtn } from 'ui/src/Select/styles'
import Spinner from 'ui/src/Spinner'
import SpinnerWrapper from 'ui/src/Spinner/SpinnerWrapper'
import { ButtonHTMLAttributes, CSSProperties, RefObject } from 'react'

const SelectBtn = ({
  loading,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  AriaButtonProps &
  ButtonProps & { buttonRef: RefObject<HTMLElement | null>; style?: CSSProperties }) => {
  const ref = props.buttonRef
  const { buttonProps } = useButton(props, ref)

  return (
    <StyledBtn {...buttonProps} $loading={loading} ref={ref as RefObject<HTMLButtonElement | null>} style={style}>
      {loading && (
        <StyledSpinnerWrapper>
          <Spinner isDisabled size={17} />
        </StyledSpinnerWrapper>
      )}
      {props.children}
    </StyledBtn>
  )
}

SelectBtn.displayName = 'SelectBtn'

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: 0;
  position: absolute;
  width: calc(100% - 0.75rem); // 0.75 = StyledBtn padding
`

export default SelectBtn
