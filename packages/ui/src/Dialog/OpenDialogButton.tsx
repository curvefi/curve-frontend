import { ReactNode, useRef } from 'react'
import { useButton } from 'react-aria'
import styled from 'styled-components'
import Button from 'ui/src/Button'
import type { ButtonProps } from 'ui/src/Button/types'
import Icon from 'ui/src/Icon/Icon'
import { delayAction } from 'ui/src/utils/helpers'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { OverlayTriggerState } from '@react-stately/overlays'

interface OpenDialogButtonProps extends ButtonProps {
  children: ReactNode
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
}: OpenDialogButtonProps) => {
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))
  const { buttonProps } = useButton(
    { onPress: () => (isMobile ? delayAction(overlayTriggerState.open) : overlayTriggerState.open()) },
    openButtonRef,
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
