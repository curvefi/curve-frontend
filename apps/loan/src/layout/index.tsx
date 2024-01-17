import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { layoutHeightKeys } from '@/store/createLayoutSlice'
import networks from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import Header from '@/layout/Header'
import Footer from '@/layout/Footer'
import GlobalBanner from '@/ui/Banner'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')

  const curve = useStore((state) => state.curve)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const isNetworkMismatched = useStore((state) => state.wallet.isNetworkMismatched)
  const layoutHeight = useStore((state) => state.layout.height)
  const setWalletStateByKey = useStore((state) => state.wallet.setStateByKey)
  const chainId = curve?.chainId

  const handleNetworkChange = () => {
    setWalletStateByKey('isSwitchNetwork', true)
  }

  const minHeight = useMemo(() => {
    let total = 0

    for (const k of layoutHeightKeys) {
      const height = layoutHeight[k]
      total += height
    }

    return total
  }, [layoutHeight])

  return (
    <>
      <GlobalBanner
        ref={globalAlertRef}
        networkName={curve?.chainId ? networks[curve.chainId].name : ''}
        showSwitchNetworkMessage={isNetworkMismatched && !!chainId}
        maintenanceMessage=""
        handleNetworkChange={handleNetworkChange}
      />
      <Container className={isMdUp ? 'hasFooter' : ''} globalAlertHeight={layoutHeight?.globalAlert}>
        <Header chainId={chainId} />
        <Main minHeight={minHeight}>{children}</Main>
        {isMdUp && chainId && <Footer chainId={chainId} />}
      </Container>
    </>
  )
}

const Main = styled.main<{ minHeight: number }>`
  margin: 0 auto;
  max-width: var(--width);
  min-height: ${({ minHeight }) => `calc(100vh - ${minHeight}px)`};
  width: 100%;
`

const Container = styled.div<{ globalAlertHeight: number }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &.hasFooter {
    min-height: ${({ globalAlertHeight }) => `calc(100vh - ${globalAlertHeight}px)`};
`

export default BaseLayout
