import React, { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { CONNECT_STAGE, ROUTE } from '@/constants'
import { layoutHeightKeys } from '@/store/createLayoutSlice'
import { getNetworkFromUrl } from '@/utils/utilsRouter'
import { getWalletChainId } from '@/store/createWalletSlice'
import { isFailure, isLoading } from '@/ui/utils'
import { useConnectWallet } from '@/common/features/connect-wallet'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'
import Header from '@/layout/Header'
import GlobalBanner from '@/ui/Banner'
import { Locale } from '@/common/widgets/Header/types'
import { t } from '@lingui/macro'
import Footer from '@/ui/Footer'
import networks from '@/networks'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }] = useConnectWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')
  const footerRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(footerRef, 'footer')

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const layoutHeight = useStore((state) => state.layout.height)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const locale = useStore((state) => state.locale)

  const [networkSwitch, setNetworkSwitch] = useState('')

  const { rChainId, rNetwork } = getNetworkFromUrl()

  const showSwitchNetworkMessage =
    isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK) || (!!networkSwitch && isLoading(connectState, networkSwitch))

  const handleNetworkChange = () => {
    const connectStage = `${CONNECT_STAGE.SWITCH_NETWORK}${getWalletChainId(wallet)}-${rChainId}`
    setNetworkSwitch(connectStage)
    updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [getWalletChainId(wallet), rChainId])
  }

  const minHeight = useMemo(() => layoutHeightKeys.reduce((total, key) => total + layoutHeight[key], 0), [layoutHeight])

  const sections = useMemo(() => getSections(rChainId, locale), [rChainId, locale])
  return (
    <>
      <GlobalBanner
        ref={globalAlertRef}
        networkName={rNetwork}
        showConnectApiErrorMessage={isFailure(connectState, CONNECT_STAGE.CONNECT_API)}
        showSwitchNetworkMessage={showSwitchNetworkMessage}
        maintenanceMessage=""
        handleNetworkChange={handleNetworkChange}
      />
      <Container className={isMdUp ? 'hasFooter' : ''} globalAlertHeight={layoutHeight?.globalAlert}>
        <Header sections={sections} />
        <Main minHeight={minHeight}>{children}</Main>
        {isMdUp && <Footer footerRef={footerRef} sections={sections} />}
      </Container>
    </>
  )
}

const getSections = (rChainId: ChainId, locale: Locale) => [
  {
    title: t`Documentation`,
    links: [
      { route: 'https://news.curve.fi/', label: t`News` },
      { route: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { route: 'https://docs.curve.fi', label: t`Developer Resources` },
      { route: ROUTE.PAGE_INTEGRATIONS, label: t`Integrations` },
      { route: 'https://resources.curve.fi/glossary-branding/branding/', label: t`Branding` },
      ...(locale === 'zh-Hans' || locale === 'zh-Hant') ? [{ route: 'https://www.curve.wiki/', label: t`Wiki` }] : [],
    ]
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { route: 'https://docs.curve.fi/references/audits/', label: t`Audits` },
      { route: `${networks[rChainId ?? 1]?.orgUIPath}/bugbounty`, label: t`Bug Bounty` },
      { route: 'https://dune.com/mrblock_buidl/Curve.fi', label: t`Dune Analytics` },
      { route: 'https://curvemonitor.com', label: t`Curve Monitor` },
      { route: 'https://crvhub.com/', label: t`Crvhub` }
    ]
  }
]

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
