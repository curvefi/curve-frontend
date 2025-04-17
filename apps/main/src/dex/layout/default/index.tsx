import { ethers } from 'ethers'
import { useParams } from 'next/navigation'
import { ReactNode, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ROUTE } from '@/dex/constants'
import useLayoutHeight from '@/dex/hooks/useLayoutHeight'
import Header from '@/dex/layout/default/Header'
import { layoutHeightKeys } from '@/dex/store/createGlobalSlice'
import useStore from '@/dex/store/useStore'
import type { CurveApi, NetworkUrlParams } from '@/dex/types/main.types'
import { getPath, useChainId } from '@/dex/utils/utilsRouter'
import { CONNECT_STAGE, isFailure, useConnection, useSetChain } from '@ui-kit/features/connect-wallet'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { Footer } from '@ui-kit/widgets/Footer'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'

const BaseLayout = ({ children }: { children: ReactNode }) => {
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')

  const { connectState } = useConnection<CurveApi>()
  const { network: rNetwork } = useParams() as NetworkUrlParams // todo: move layout to [network] folder and pass params as prop
  const rChainId = useChainId(rNetwork)
  const [, setWalletChain] = useSetChain()

  const layoutHeight = useStore((state) => state.layoutHeight)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)

  const sections = useMemo(() => getSections(rNetwork), [rNetwork])
  const minHeight = useMemo(() => layoutHeightKeys.reduce((total, key) => total + layoutHeight[key], 0), [layoutHeight])

  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header
        sections={sections}
        BannerProps={{
          ref: globalAlertRef,
          networkName: rNetwork,
          showConnectApiErrorMessage: isFailure(connectState, CONNECT_STAGE.CONNECT_API),
          showSwitchNetworkMessage: isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK),
          maintenanceMessage: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE,
          handleNetworkChange: () => setWalletChain({ chainId: ethers.toQuantity(rChainId) }),
        }}
      />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="dex" networkName={rNetwork} headerHeight={useHeaderHeight(bannerHeight)} />
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
