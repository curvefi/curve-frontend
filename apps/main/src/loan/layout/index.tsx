import React, { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { CONNECT_STAGE, ROUTE } from '@loan/constants'
import { layoutHeightKeys } from '@loan/store/createLayoutSlice'
import { getNetworkFromUrl } from '@loan/utils/utilsRouter'
import { getWalletChainId, useWallet } from '@ui-kit/features/connect-wallet'
import { isFailure, isLoading } from '@ui/utils'
import useLayoutHeight from '@loan/hooks/useLayoutHeight'
import useStore from '@loan/store/useStore'
import Header from '@loan/layout/Header'
import { Locale } from '@ui-kit/widgets/Header/types'
import { t } from '@lingui/macro'
import { Footer } from '@ui-kit/widgets/Footer'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const { wallet } = useWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')

  const connectState = useStore((state) => state.connectState)
  const layoutHeight = useStore((state) => state.layout.height)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const locale = useUserProfileStore((state) => state.locale)

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

  const sections = useMemo(() => getSections(locale, rNetwork), [locale, rNetwork])
  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header
        sections={sections}
        BannerProps={{
          ref: globalAlertRef,
          networkName: rNetwork,
          showConnectApiErrorMessage: isFailure(connectState, CONNECT_STAGE.CONNECT_API),
          showSwitchNetworkMessage,
          handleNetworkChange,
        }}
      />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="crvusd" networkName={rNetwork} />
    </Container>
  )
}

const getSections = (locale: Locale, network: string) => [
  {
    title: t`Documentation`,
    links: [
      { route: 'https://news.curve.fi/', label: t`News` },
      { route: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { route: 'https://docs.curve.fi', label: t`Developer Resources` },
      { route: `${network ? `/${network}` : ''}${ROUTE.PAGE_DISCLAIMER}?tab=crvusd`, label: t`Risk Disclaimers` },
      { route: `${network ? `/${network}` : ''}${ROUTE.PAGE_INTEGRATIONS}`, label: t`Integrations` },
      { route: 'https://resources.curve.fi/glossary-branding/branding/', label: t`Branding` },
      ...(locale === 'zh-Hans' || locale === 'zh-Hant' ? [{ route: 'https://www.curve.wiki/', label: t`Wiki` }] : []),
    ],
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { route: 'https://docs.curve.fi/references/audits/', label: t`Audits` },
      { route: 'https://docs.curve.fi/security/security/', label: t`Bug Bounty` },
      { route: 'https://dune.com/mrblock_buidl/Curve.fi', label: t`Dune Analytics` },
      { route: 'https://curvemonitor.com', label: t`Curve Monitor` },
      { route: 'https://crvhub.com/', label: t`Crvhub` },
    ],
  },
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
  min-height: ${({ globalAlertHeight }) => `calc(100vh - ${globalAlertHeight}px)`};
`

export default BaseLayout
