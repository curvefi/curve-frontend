import { ReactNode, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { CONNECT_STAGE, ROUTE } from '@/dex/constants'
import useLayoutHeight from '@/dex/hooks/useLayoutHeight'
import Header from '@/dex/layout/default/Header'
import { layoutHeightKeys } from '@/dex/store/createGlobalSlice'
import useStore from '@/dex/store/useStore'
import { getPath, useNetworkFromUrl } from '@/dex/utils/utilsRouter'
import { isFailure, isLoading } from '@ui/utils'
import { getWalletChainId, useWallet } from '@ui-kit/features/connect-wallet'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { Footer } from '@ui-kit/widgets/Footer'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'

const BaseLayout = ({ children }: { children: ReactNode }) => {
  const { wallet } = useWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')

  const connectState = useStore((state) => state.connectState)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const { rChainId, rNetwork } = useNetworkFromUrl()

  const sections = useMemo(() => getSections(rNetwork), [rNetwork])

  // Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

  const [networkSwitch, setNetworkSwitch] = useState('')

  const showSwitchNetworkMessage =
    isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK) || (!!networkSwitch && isLoading(connectState, networkSwitch))

  const handleNetworkChange = () => {
    const connectStage = `${CONNECT_STAGE.SWITCH_NETWORK}${getWalletChainId(wallet)}-${rChainId}`
    setNetworkSwitch(connectStage)
    updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [getWalletChainId(wallet), rChainId])
  }

  const minHeight = useMemo(() => layoutHeightKeys.reduce((total, key) => total + layoutHeight[key], 0), [layoutHeight])

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
      <Footer appName="dex" networkName={rNetwork} />
    </Container>
  )
}

const getSections = (network: string): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: 'https://news.curve.fi/', label: t`News` },
      { href: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { href: 'https://docs.curve.fi', label: t`Developer Resources` },
      { href: getPath({ network }, ROUTE.PAGE_DISCLAIMER), label: t`Risk Disclaimers` },
      { href: getPath({ network }, ROUTE.PAGE_INTEGRATIONS), label: t`Integrations` },
      { href: 'https://resources.curve.fi/glossary-branding/branding/', label: t`Branding` },
      ...(isChinese() ? [{ href: 'https://www.curve.wiki/', label: t`Wiki` }] : []),
    ],
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { href: 'https://docs.curve.fi/references/audits/', label: t`Audits` },
      { href: 'https://docs.curve.fi/security/security/', label: t`Bug Bounty` },
      { href: 'https://dune.com/mrblock_buidl/Curve.fi', label: t`Dune Analytics` },
      { href: 'https://curvemonitor.com', label: t`Curve Monitor` },
      { href: 'https://crvhub.com/', label: t`Crvhub` },
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
`

const Container = styled.div<{ globalAlertHeight: number }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: ${({ globalAlertHeight }) => `calc(100vh - ${globalAlertHeight}px)`};
`

export default BaseLayout
