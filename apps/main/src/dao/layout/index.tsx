import { Locale } from '@ui-kit/widgets/Header/types'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import { CONNECT_STAGE, isFailure, isLoading } from '@/ui/utils'
import { getWalletChainId } from '@/store/createWalletSlice'
import { getNetworkFromUrl } from '@/utils/utilsRouter'
import { useConnectWallet } from '@ui-kit/features/connect-wallet'
import { useHeightResizeObserver } from '@/ui/hooks'
import useStore from '@/store/useStore'

import Header from '@/layout/Header'
import { Footer } from '@ui-kit/widgets/Footer'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }] = useConnectWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const globalAlertHeight = useHeightResizeObserver(globalAlertRef)

  const connectState = useStore((state) => state.connectState)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)

  const locale = useUserProfileStore((state) => state.locale)

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

  const sections = useMemo(() => getSections(locale), [locale])
  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header
        sections={sections}
        BannerProps={{
          ref: globalAlertRef,
          networkName: rNetwork,
          showConnectApiErrorMessage: isFailure(connectState, CONNECT_STAGE.CONNECT_API),
          showSwitchNetworkMessage,
          maintenanceMessage,
          handleNetworkChange,
        }}
      />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="dao" networkName={rNetwork} />
    </Container>
  )
}

const getSections = (locale: Locale) => [
  {
    title: t`Documentation`,
    links: [
      { route: 'https://news.curve.fi/', label: t`News` },
      { route: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { route: 'https://docs.curve.fi', label: t`Developer Resources` },
      { route: '/disclaimer', label: t`Risk Disclaimers` },
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
  min-height: ${({ globalAlertHeight }) => `calc(100vh - ${globalAlertHeight}px)`};
`

export default BaseLayout
