import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { FocusScope } from '@react-aria/focus'
import { OverlayContainer, usePreventScroll } from '@react-aria/overlays'

interface Props {
  children: ReactNode
  isOpen: boolean
}

// TODO: consolidate with overlay-container.tsx
export const Overlay = ({ children, isOpen, ...rest }: Props) => {
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
