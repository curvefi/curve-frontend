import { ReactNode, useRef } from 'react'
import type { AriaOverlayProps } from 'react-aria'
import { FocusScope, Overlay, useButton, useDialog, useModalOverlay, usePreventScroll } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'
import { styled } from 'styled-components'
import type { AriaDialogProps } from '@react-types/dialog'
import { Box } from '@ui/Box/Box'
import { Icon } from '@ui/Icon/Icon'
import { IconButton } from '@ui/IconButton'
import { breakpoints } from '@ui/utils/responsive'

export const ModalDialog = ({
  children,
  footerContent,
  maxWidth,
  noContentPadding = false,
  state,
  title,
  testId,
  ...props
}: AriaOverlayProps &
  AriaDialogProps & {
    children: ReactNode
    footerContent?: ReactNode
    maxWidth?: string
    noContentPadding?: boolean
    state: OverlayTriggerState
    testId?: string
    title: string
  }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle interacting outside the dialog and pressing
  // the Escape key to close the modal.
  const { modalProps, underlayProps } = useModalOverlay({ isDismissable: true, ...props }, state, modalRef)
  const { titleProps } = useDialog(props, modalRef)
  usePreventScroll({ isDisabled: false }) // prevent scrolling while modal is open

  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => {
        if (typeof state.close === 'function') state.close()
      },
    },
    closeButtonRef,
  )

  const showCloseButton = !!state.close

  return (
    <Overlay>
      <Underlay {...underlayProps}>
        <FocusScope contain restoreFocus autoFocus>
          <StyledModalContainer {...modalProps} data-testid={`modal-${testId}`} ref={modalRef} maxWidth={maxWidth}>
            {title && (
              <Header {...titleProps} showCloseButton={showCloseButton}>
                {title}
                {showCloseButton && (
                  <IconButton testId="close" {...closeButtonProps} ref={closeButtonRef} padding={2}>
                    <Icon name="Close" size={24} aria-label="Close" />
                  </IconButton>
                )}
              </Header>
            )}
            <ContentWrapper padding={noContentPadding ? '0' : 'var(--spacing-3)'}>
              <div>{children}</div>
              {footerContent && <Footer>{footerContent}</Footer>}
            </ContentWrapper>
          </StyledModalContainer>
        </FocusScope>
      </Underlay>
    </Overlay>
  )
}

const Header = styled.h2<{ showCloseButton?: boolean }>`
  align-items: center;
  display: flex;
  justify-content: ${({ showCloseButton }) => (showCloseButton ? 'space-between' : 'flex-start')};

  min-height: var(--box_header--height);
  padding: 0 var(--spacing-2);
  padding-left: var(--spacing-3);
`

const Footer = styled.footer`
  margin-top: 1rem;
`

const ContentWrapper = styled(Box)``

const StyledModalContainer = styled.div<{ maxWidth?: string }>`
  display: flex;
  flex-direction: column;
  width: calc(100% - var(--spacing-4));

  color: var(--page--text-color);
  background-color: var(--dialog--background-color);
  border: 3px solid var(--dialog--border-color);

  @media (min-width: ${breakpoints.xxs}rem) {
    height: 100%;
    width: 100%;
    max-width: 100%;
    border: none;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    height: auto;
    max-width: ${({ maxWidth }) => maxWidth ?? '28.125rem'}; //450px
  }
`

const Underlay = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: var(--z-index-overlay);

  backdrop-filter: blur(3px);
  background: var(--dialog--background-color);

  @media (min-width: ${breakpoints.sm}rem) {
    background: rgba(0, 0, 0, 0.5);
  }
`
