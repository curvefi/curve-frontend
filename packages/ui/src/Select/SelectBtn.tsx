import type { ButtonProps } from 'ui/src/Button/types'
import type { AriaButtonProps } from 'react-aria'

import { useButton } from 'react-aria'
import * as React from 'react'
import styled from 'styled-components'

import { StyledBtn } from 'ui/src/Select/styles'
import Spinner from 'ui/src/Spinner'
import SpinnerWrapper from 'ui/src/Spinner/SpinnerWrapper'

const SelectBtn = ({
  loading,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  AriaButtonProps &
  ButtonProps & { buttonRef: React.RefObject<HTMLElement | null>; style?: React.CSSProperties }) => {
  const ref = props.buttonRef
  const { buttonProps } = useButton(props, ref)

  return (
    <StyledBtn {...buttonProps} $loading={loading} ref={ref as React.RefObject<HTMLButtonElement | null>} style={style}>
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
