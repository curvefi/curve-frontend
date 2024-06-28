import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { CONNECT_STAGE, getWallet, isFailure, useConnectWallet } from '@/onboard'
import { layoutHeightKeys } from '@/store/createLayoutSlice'
import { getNetworkFromUrl } from '@/utils/utilsRouter'
import networks from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'

import Header from '@/layout/Header'
import Footer from '@/layout/Footer'
import GlobalBanner from '@/ui/Banner'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }] = useConnectWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const layoutHeight = useStore((state) => state.layout.height)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { rChainId, rNetwork } = getNetworkFromUrl()
  const { walletChainId } = getWallet(wallet)

  const showSwitchNetworkMessage =
    isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK) || (!!walletChainId && !(walletChainId in networks))

  const handleNetworkChange = (walletChainId: string) => {
    updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [+walletChainId, rChainId])
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
        networkName={rNetwork}
        showConnectApiErrorMessage={isFailure(connectState, CONNECT_STAGE.CONNECT_API)}
        showSwitchNetworkMessage={showSwitchNetworkMessage}
        maintenanceMessage=""
        handleNetworkChange={() => walletChainId && handleNetworkChange(walletChainId)}
      />
      <Container className={isMdUp ? 'hasFooter' : ''} globalAlertHeight={layoutHeight?.globalAlert}>
        <Header />
        <Main minHeight={minHeight}>{children}</Main>
        {isMdUp && <Footer chainId={rChainId} />}
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
  }
`

export default BaseLayout
