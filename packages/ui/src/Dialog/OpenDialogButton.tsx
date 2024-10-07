import type { OverlayTriggerState } from '@react-stately/overlays'

import React, { useRef } from 'react'
import { useButton } from 'react-aria'
import styled from 'styled-components'

import Button from 'ui/src/Button'
import type { ButtonProps } from 'ui/src/Button/types'
import Icon from 'ui/src/Icon/Icon'
import { delayAction, getIsMobile } from 'ui/src/utils/helpers'

interface OpenDialogButtonProps extends ButtonProps {
  overlayTriggerState: OverlayTriggerState
  showBorder?: boolean
  showCaret?: boolean
}

const OpenDialogButton = ({
  children,
  overlayTriggerState,
  showBorder,
  showCaret,
  ...props
}: React.PropsWithChildren<OpenDialogButtonProps>) => {
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(
    { onPress: () => (getIsMobile() ? delayAction(overlayTriggerState.open) : overlayTriggerState.open()) },
    openButtonRef
  )

  return (
    <Button size="medium" {...buttonProps} {...props} ref={openButtonRef}>
      {children} {showCaret ? <StyledCaretDown16 name="CaretDown" size={16} /> : null}
    </Button>
  )
}

const StyledCaretDown16 = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default OpenDialogButton
