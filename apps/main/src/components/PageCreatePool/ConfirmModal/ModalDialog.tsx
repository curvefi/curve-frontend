import type { AriaDialogProps } from '@react-types/dialog'
import type { AriaOverlayProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'

import { Overlay, FocusScope, useButton, useDialog, usePreventScroll, useModalOverlay } from 'react-aria'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import useStore from '@/store/useStore'

import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import IconButton from '@/ui/IconButton'

interface Props extends AriaOverlayProps, AriaDialogProps {
  footerContent?: React.ReactNode
  maxWidth?: string
  noContentPadding?: boolean
  title: string
  state: OverlayTriggerState
}

const ModalDialog = ({
  children,
  footerContent,
  maxWidth,
  noContentPadding = false,
  state,
  title,
  ...props
}: React.PropsWithChildren<Props>) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle interacting outside the dialog and pressing
  // the Escape key to close the modal.
  const { modalProps, underlayProps } = useModalOverlay({ isDismissable: true, ...props }, state, modalRef)
  const { titleProps } = useDialog(props, modalRef)
  usePreventScroll({ isDisabled: false }) // prevent scrolling while modal is open

  const isMobile = useStore((state) => state.isMobile)
  const isSmUp = useStore((state) => state.isSmUp)

  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => {
        if (typeof state.close === 'function') state.close()
      },
    },
    closeButtonRef
  )

  const showCloseButton = !!state.close

  return (
    <Overlay>
      <Underlay {...underlayProps}>
        <FocusScope contain restoreFocus autoFocus>
          <ModalContainer
            {...modalProps}
            ref={modalRef}
            isFullScreen={!isSmUp || (isMobile && !isSmUp)}
            maxWidth={maxWidth}
          >
            {title && (
              <Header {...titleProps} showCloseButton={showCloseButton}>
                {title}
                {showCloseButton && (
                  <IconButton {...closeButtonProps} ref={closeButtonRef} padding={2}>
                    <Icon name={'Close'} size={24} aria-label="Close" />
                  </IconButton>
                )}
              </Header>
            )}
            <ContentWrapper>
              <div>{children}</div>
              {footerContent && <Footer>{footerContent}</Footer>}
            </ContentWrapper>
          </ModalContainer>
        </FocusScope>
      </Underlay>
    </Overlay>
  )
}

const Header = styled.h3<{ showCloseButton?: boolean }>`
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

const ContentWrapper = styled(Box)`
  padding-bottom: var(--spacing-narrow);
  overflow-y: scroll;
`

const ModalContainer = styled.div<{ maxWidth?: string; isFullScreen: boolean }>`
  display: flex;
  flex-direction: column;
  width: calc(100% - var(--spacing-4));

  color: var(--page--text-color);
  background-color: var(--dialog--background-color);
  max-height: 95vh;

  ${ContentWrapper} {
    ${({ isFullScreen }) => {
      if (isFullScreen) {
        return `
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          max-height: 100vh;
        `
      }
    }}
  }

  ${({ isFullScreen, maxWidth }) => {
    if (isFullScreen) {
      return `
        height: 100%;
        width: 100%;
        max-width: 100%;
        border: none;
        max-height: 100vh;
      `
    } else {
      return `
        max-width: ${maxWidth || '28.125rem'}; //450px
      `
    }
  }}
`

const Underlay = styled.div`
  max-height: 100vh;
  align-items: center;
  display: flex;
  justify-content: center;
  position: fixed;
  overflow-y: scroll;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: var(--z-index-page-settings);

  backdrop-filter: blur(3px);
  background: var(--dialog--background-color);

  @media (min-width: ${breakpoints.sm}rem) {
    background: rgba(0, 0, 0, 0.5);
  }
`

export default ModalDialog
