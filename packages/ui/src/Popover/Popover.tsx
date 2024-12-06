import type { AriaOverlayProps } from 'react-aria'

import * as React from 'react'
import styled from 'styled-components'

import { useOverlay, DismissButton } from '@react-aria/overlays'
import { FocusScope } from '@react-aria/focus'

interface Props extends AriaOverlayProps {
  popoverRef: React.RefObject<HTMLDivElement>
}

const Popover = (props: React.PropsWithChildren<Props>) => {
  let ref = React.useRef<HTMLDivElement>(null)
  let { popoverRef = ref, isOpen, onClose, children } = props

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: true,
      isDismissable: true,
    },
    popoverRef,
  )

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <FocusScope restoreFocus>
      <Container {...overlayProps} ref={popoverRef}>
        {children}
        <DismissButton onDismiss={onClose} />
      </Container>
    </FocusScope>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
`

export default Popover
