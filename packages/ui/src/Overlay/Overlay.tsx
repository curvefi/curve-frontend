import { usePreventScroll, OverlayContainer } from '@react-aria/overlays'
import { FocusScope } from '@react-aria/focus'
import styled from 'styled-components'
import React from 'react'

interface Props {
  isOpen: boolean
}

// TODO: consolidate with overlay-container.tsx
const Overlay = ({ children, isOpen, ...rest }: React.PropsWithChildren<Props>) => {
  usePreventScroll({ isDisabled: !isOpen })

  return (
    <OverlayContainer>
      <StyledOverlay isOpen={isOpen} {...rest}>
        <FocusScope restoreFocus>{children}</FocusScope>
      </StyledOverlay>
    </OverlayContainer>
  )
}

type StyledOverlayProps = {
  isOpen: boolean
}

const StyledOverlay = styled.div<StyledOverlayProps>`
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  z-index: var(--z-index-overlay);

  background: rgba(0, 0, 0, 0.5);

  backdrop-filter: blur(3px);
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
`

export default Overlay
