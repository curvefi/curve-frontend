import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'

import networks from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import Header from '@/layout/default/Header'
import Footer from '@/layout/default/Footer'
import GlobalBanner from '@/ui/Banner'

const BaseLayout = ({ children, ...pageProps }: React.PropsWithChildren<PageProps>) => {
  const { chainId } = pageProps
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')

  const curve = useStore((state) => state.curve)
  const isMdUp = useStore((state) => state.isMdUp)
  const isNetworkMismatched = useStore((state) => state.wallet.isNetworkMismatched)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const updateWalletStoreByKey = useStore((state) => state.wallet.updateWalletStoreByKey)

  // Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE
  const showSwitchNetworkMessage = isNetworkMismatched

  const handleNetworkChange = () => {
    updateWalletStoreByKey('isSwitchNetwork', true)
  }

  const minHeight = useMemo(() => {
    let total = 0

    Object.entries(layoutHeight).forEach(([_, height]) => {
      total += height
    })

    return total
  }, [layoutHeight])

  return (
    <>
      <GlobalBanner
        ref={globalAlertRef}
        networkName={curve?.chainId ? networks[curve.chainId].name : ''}
        showSwitchNetworkMessage={showSwitchNetworkMessage}
        maintenanceMessage={maintenanceMessage}
        handleNetworkChange={handleNetworkChange}
      />
      <Container className={isMdUp ? 'hasFooter' : ''} globalAlertHeight={layoutHeight?.globalAlert}>
        <Header {...pageProps} />
        <Main minHeight={minHeight}>{children}</Main>
        {isMdUp && <Footer chainId={chainId} />}
      </Container>
    </>
  )
}

type MainProps = {
  minHeight: number
}

const Main = styled.main<MainProps>`
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
  }
`

export default BaseLayout
