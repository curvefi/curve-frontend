import { CONNECT_STAGE, ROUTE } from '@/lend/constants'
import Header from '@/lend/layout/Header'
import { layoutHeightKeys } from '@/lend/store/createLayoutSlice'
import useStore from '@/lend/store/useStore'
import { getNetworkFromUrl } from '@/lend/utils/utilsRouter'
import { getWalletChainId, useWallet } from '@ui-kit/features/connect-wallet'
import useHeightResizeObserver from '@ui-kit/hooks/useHeightResizeObserver'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { Footer } from '@ui-kit/widgets/Footer'
import { isFailure, isLoading } from '@ui/utils'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

const BaseLayout = ({ children }: { children: ReactNode }) => {
  const { wallet } = useWallet()
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const elHeight = useHeightResizeObserver(globalAlertRef)
  const footerRef = useRef<HTMLDivElement>(null)
  const footerHeight = useHeightResizeObserver(footerRef)

  const connectState = useStore((state) => state.connectState)
  const layoutHeight = useStore((state) => state.layout.height)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const updateConnectState = useStore((state) => state.updateConnectState)

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

  useEffect(() => {
    setLayoutHeight('globalAlert', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  useEffect(() => {
    setLayoutHeight('footer', footerHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerHeight])

  const sections = useMemo(() => getSections(rNetwork), [rNetwork])
  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header
        chainId={rChainId}
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
      <Footer appName="lend" networkName={rNetwork} />
    </Container>
  )
}

const getSections = (network: string) => [
  {
    title: t`Documentation`,
    links: [
      { route: 'https://news.curve.fi/', label: t`News` },
      { route: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { route: 'https://docs.curve.fi', label: t`Developer Resources` },
      { route: `${network ? `/${network}` : ''}${ROUTE.PAGE_DISCLAIMER}?tab=lend`, label: t`Risk Disclaimers` },
      { route: `${network ? `/${network}` : ''}${ROUTE.PAGE_INTEGRATIONS}`, label: t`Integrations` },
      { route: 'https://resources.curve.fi/glossary-branding/branding/', label: t`Branding` },
      ...(isChinese() ? [{ route: 'https://www.curve.wiki/', label: t`Wiki` }] : []),
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
  min-height: ${({ minHeight }) => `calc(100vh - ${minHeight}px - var(--header-height))`};
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
