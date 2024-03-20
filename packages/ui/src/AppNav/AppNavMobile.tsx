import type { AppNavMobileProps } from 'ui/src/AppNav/types'

import React, { useMemo, useRef, useState } from 'react'
import { useOverlay } from '@react-aria/overlays'
import { useOverlayTriggerState } from 'react-stately'
import Image from 'next/image'
import delay from 'lodash/delay'
import styled from 'styled-components'

import { LlamaImg } from 'ui/src/images'
import AppNavMobileExternalLinks from 'ui/src/AppNav/AppNavMobileExternalLinks'
import AppNavMobileShowMore from 'ui/src/AppNav/AppNavMobileShowMore'
import AppNavMobileStats from 'ui/src/AppNav/AppNavMobileStats'
import AppLogo from 'ui/src/Brand'
import Box from 'ui/src/Box'
import Button from 'ui/src/Button'
import ConnectWallet from 'ui/src/Button/ConnectWallet'
import Icon from 'ui/src/Icon'
import IconButton from 'ui/src/IconButton'
import Overlay from 'ui/src/Overlay'
import SelectLocale from 'ui/src/Select/SelectLocale'
import SelectThemes from 'ui/src/Select/SelectThemes'
import Spacer from 'ui/src/Spacer'
import Switch from 'ui/src/Switch'

const DEFAULT_MENUS_WIDTH = [0, 0]

const AppNavMobile = ({
  appLogoProps,
  connect,
  advancedMode,
  locale,
  pageWidth,
  pages,
  sections,
  selectNetwork: SelectNetwork,
  stats,
  theme,
}: AppNavMobileProps) => {
  const leftMenuRef = useRef<HTMLDivElement | null>(null)
  const leftButtonRef = useRef<HTMLButtonElement | null>(null)
  const leftButtonCloseRef = useRef<HTMLButtonElement | null>(null)
  const overlayTriggerState = useOverlayTriggerState({})

  const [menusWidth, setMenusWidth] = useState(DEFAULT_MENUS_WIDTH)
  const [show, setShow] = useState(-1)
  const [showLocaleList, setShowLocaleList] = useState(false)

  const menuWidth = useMemo(() => (pageWidth === 'page-small-x' ? 270 : 300), [pageWidth])

  const openMenu = (updatedMenusWidth: number[]) => {
    setMenusWidth(updatedMenusWidth)
    overlayTriggerState.open()

    if (updatedMenusWidth[0] && leftButtonCloseRef.current) {
      leftButtonCloseRef.current.focus()
    }
  }

  const closeMenu = (currentMenusWidth: number[]) => {
    setShow(-1)
    setMenusWidth(DEFAULT_MENUS_WIDTH)
    delay(() => overlayTriggerState.close(), 300)

    if (currentMenusWidth[0] && leftButtonRef.current) {
      leftButtonRef.current.focus()
    }
  }

  const leftOverlayProps = {
    isOpen: !!menusWidth[0],
    onClose: () => closeMenu([menuWidth, 0]),
    isDismissable: true,
  }

  const leftOverlay = useOverlay(leftOverlayProps, leftMenuRef)

  return (
    <>
      {/* PAGE NAV */}
      <Box display="inline-flex" flexAlignItems="center">
        <IconButton ref={leftButtonRef} onClick={() => openMenu([menuWidth, 0])}>
          <Icon name="Menu" size={24} aria-label="menu icon" />
        </IconButton>
        <StyledAppLogo {...appLogoProps} />
      </Box>

      <Spacer />
      <Menu>{SelectNetwork}</Menu>

      {/* PAGE OVERLAY */}
      <Overlay isOpen={leftOverlayProps.isOpen} {...leftOverlay.underlayProps}>
        <ModalWrapper ref={leftMenuRef} placement="left" width={menusWidth[0]} {...leftOverlay.overlayProps}>
          {/* MODAL HEADER */}
          <ModalHeader>
            <AppLogo {...appLogoProps} />
            <IconButton ref={leftButtonCloseRef} onClick={() => closeMenu([menuWidth, 0])}>
              <Icon name="Close" size={24} aria-label="close icon" />
            </IconButton>
          </ModalHeader>

          {/* MODAL CONTENT */}
          <ModalContent
            className="mobile-menu"
            grid
            gridRowGap={4}
            padding="var(--spacing-normal) var(--spacing-3) 0 var(--spacing-3)"
          >
            <Box grid gridRowGap={3}>
              {pages.pages().map(({ route, label }) => (
                <MobileButton
                  key={route}
                  onClick={() => {
                    pages.handleClick(route)
                    closeMenu([menuWidth, 0])
                  }}
                >
                  {label}
                </MobileButton>
              ))}
            </Box>

            <Box grid gridRowGap={3}>
              {/* MORE */}
              <div>
                {sections.map(({ title, links, comp }, idx) => (
                  <AppNavMobileShowMore key={title} buttonLabel={title} idx={idx} show={idx === show} setShow={setShow}>
                    <AppNavMobileExternalLinks links={links} comp={comp} />
                  </AppNavMobileShowMore>
                ))}
              </div>

              {/* THEME */}
              <StyledSelectThemes label="Mode" themeType={theme.themeType} handleThemeChange={theme.handleClick} />

              {/* LOCALE */}
              {typeof locale !== 'undefined' && (
                <div>
                  <SelectLocale
                    locales={locale.locales}
                    selectedLocale={locale.locale}
                    mobileHeader={{ showList: showLocaleList, setShowList: setShowLocaleList }}
                    handleLocaleChange={(selectedLocale: React.Key) => {
                      locale.handleChange(selectedLocale as string)
                      closeMenu([menuWidth, 0])
                    }}
                  />
                </div>
              )}

              {/* ADVANCED MODE */}
              {typeof advancedMode !== 'undefined' && (
                <Switch isSelected={advancedMode.isAdvanceMode} onChange={advancedMode.handleClick}>
                  <strong>Advanced mode {advancedMode.isAdvanceMode ? 'on' : 'off'}</strong>
                </Switch>
              )}

              {/* APP STATS */}
              <Box margin="var(--spacing-wide) 0 0 0">
                <AppNavMobileStats stats={stats} />
                <Image src={LlamaImg} alt="Llama" width="32" height="40" />
              </Box>
            </Box>
          </ModalContent>

          <Spacer />

          {/* MODAL FOOTER */}
          <ModalFooter>
            <StyledConnectWallet
              connectState={connect.connectState}
              walletSignerAddress={connect.walletSignerAddress}
              handleClick={() => {
                connect.handleClick()
                closeMenu([menuWidth, 0])
              }}
            />
          </ModalFooter>
        </ModalWrapper>
      </Overlay>
    </>
  )
}

const StyledAppLogo = styled(AppLogo)`
  transform: scale(80%) translate(-15%, 0%);
  width: 110px;
`

const MobileButton = styled(Button).attrs(() => ({
  size: 'medium',
  variant: 'text',
}))`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 1.125rem;
`

const StyledSelectThemes = styled(SelectThemes)`
  justify-content: flex-start;
  min-height: 1.125rem;

  svg {
    margin: 0 var(--spacing-2);
  }
`

const StyledConnectWallet = styled(ConnectWallet)`
  justify-content: center;
  width: 100%;
  min-height: var(--height-large);
`

/*
 * MODAL
 */
const ModalHeader = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-narrow) var(--spacing-2) 0 var(--spacing-narrow);
  min-height: var(--box_header--height);
`

const ModalContent = styled(Box)`
  overflow-x: hidden;
  overflow-y: scroll;
  transition: max-height 0.15s ease-out;

  li {
    margin-top: var(--spacing-3);
    margin-left: var(--spacing-1);
  }

  button {
    width: 100%;
  }

  a,
  button,
  .title {
    color: inherit;
    font-family: inherit;
    font-size: var(--font-size-4);
    font-weight: var(--font-weight--bold);
    padding: 0;
    margin: 0;
    text-align: left;
    text-transform: initial;
    text-decoration: none;
  }

  .collapsed {
    max-height: 0;
    overflow: hidden;

    a,
    button,
    .title {
      font-size: 1rem;
      font-weight: normal;
    }

    &.show {
      max-height: 1000px;
      transition: max-height 0.25s ease-in;
    }
  }
`

const ModalFooter = styled.div`
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-normal);
`

const ModalWrapper = styled.section<{
  width: number
  placement: 'left' | 'right'
}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${({ placement }) => (placement === 'left' ? 'left: 0;' : 'right: 0;')}
  overflow: hidden;
  padding: 0;
  position: fixed;
  top: 0;
  width: ${({ width }) => `${width}px`};
  z-index: var(--z-index-page-mobile-nav);

  color: var(--nav--color);
  background-color: var(--dialog--background-color);

  transition: width 0.2s;
`

/*
 * MOBILE NAVBAR
 */
const Item = styled.div<{ active?: boolean }>`
  align-items: center;
  display: flex;
  margin: 0 var(--spacing-narrow);
`

const Menu = styled.div`
  align-items: center;
  display: grid;
  margin: 0;
  padding: 0;

  list-style: none;

  grid-auto-flow: column;
  grid-gap: var(--spacing-2);

  ${Item}:first-of-type, ${Item}:last-of-type {
    margin-left: 0;
  }
`

export default AppNavMobile
