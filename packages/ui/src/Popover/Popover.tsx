import { ReactNode, RefObject, useRef } from 'react'
import { DismissButton, FocusScope, useOverlay } from 'react-aria'
import type { AriaOverlayProps } from 'react-aria'
import { styled } from 'styled-components'

type Props = {
  popoverRef: RefObject<HTMLDivElement | null>
  children: ReactNode
} & AriaOverlayProps

export const Popover = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const { popoverRef = ref, isOpen, onClose, children } = props

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  const { overlayProps } = useOverlay(
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
