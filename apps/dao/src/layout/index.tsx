import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { CONNECT_STAGE, isFailure, isLoading } from '@/ui/utils'
import { getWalletChainId } from '@/store/createWalletSlice'
import { getNetworkFromUrl } from '@/utils/utilsRouter'
import { useConnectWallet } from '@/common/features/connect-wallet'
import { useHeightResizeObserver } from '@/ui/hooks'
import useStore from '@/store/useStore'

import Header from '@/layout/Header'
import Footer from '@/layout/Footer'
import GlobalBanner from '@/ui/Banner'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }] = useConnectWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const globalAlertHeight = useHeightResizeObserver(globalAlertRef)

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.isMdUp)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)

  useEffect(() => {
    updateLayoutHeight('globalAlert', globalAlertHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalAlertHeight])

  // Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

  const [networkSwitch, setNetworkSwitch] = useState('')

  const { rChainId, rNetwork } = getNetworkFromUrl()

  const showSwitchNetworkMessage =
    isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK) || (!!networkSwitch && isLoading(connectState, networkSwitch))

  const handleNetworkChange = () => {
    const connectStage = `${CONNECT_STAGE.SWITCH_NETWORK}${getWalletChainId(wallet)}-${rChainId}`
    setNetworkSwitch(connectStage)
    updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [getWalletChainId(wallet), rChainId])
  }

  const minHeight = useMemo(() => {
    let total = 0

    Object.entries(layoutHeight).forEach(([_, height]) => {
      total += height
    })

    return total - layoutHeight.footer + 24
  }, [layoutHeight])

  return (
    <>
      <GlobalBanner
        ref={globalAlertRef}
        networkName={rNetwork}
        showConnectApiErrorMessage={isFailure(connectState, CONNECT_STAGE.CONNECT_API)}
        showSwitchNetworkMessage={showSwitchNetworkMessage}
        maintenanceMessage={maintenanceMessage}
        handleNetworkChange={handleNetworkChange}
      />
      <Container className={isMdUp ? 'hasFooter' : ''} globalAlertHeight={layoutHeight?.globalAlert}>
        <Header />
        <Main minHeight={minHeight}>{children}</Main>
        {isMdUp && <Footer chainId={rChainId} />}
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
  display: flex;
  flex-direction: column;
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
