import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import Header from '@/dao/layout/Header'
import useStore from '@/dao/store/useStore'
import { getEthPath, getNetworkFromUrl } from '@/dao/utils/utilsRouter'
import { CONNECT_STAGE, isFailure, isLoading } from '@ui/utils'
import { getWalletChainId, useWallet } from '@ui-kit/features/connect-wallet'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { Footer } from '@ui-kit/widgets/Footer'
import { NavigationSection } from '@ui-kit/widgets/Header/types'
import { useHeaderHeight } from '@ui-kit/widgets/Header'

const BaseLayout = ({ children }: { children: ReactNode }) => {
  const { wallet } = useWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const [, globalAlertHeight] = useResizeObserver(globalAlertRef) ?? []

  const connectState = useStore((state) => state.connectState)
  const layoutHeight = useStore((state) => state.layoutHeight)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)

  useEffect(() => {
    updateLayoutHeight('globalAlert', globalAlertHeight ?? null)
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

  const sections = useMemo(() => getSections(), [])
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
      <Footer appName="dao" networkName={rNetwork} headerHeight={useHeaderHeight(bannerHeight)} />
    </Container>
  )
}

const getSections = (): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: 'https://news.curve.fi/', label: t`News` },
      { href: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { href: 'https://docs.curve.fi', label: t`Developer Resources` },
      { href: getEthPath(DAO_ROUTES.PAGE_DISCLAIMER), label: t`Risk Disclaimers` },
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
