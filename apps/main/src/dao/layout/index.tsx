import { ethers } from 'ethers'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Header } from '@/dao/layout/Header'
import useStore from '@/dao/store/useStore'
import type { ChainId, CurveApi, NetworkEnum } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils/utilsRouter'
import { CONNECT_STAGE, isFailure, useConnection, useSetChain } from '@ui-kit/features/connect-wallet'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { Footer } from '@ui-kit/widgets/Footer'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

const useAutoRefresh = (curve?: CurveApi) => {
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const getProposals = useStore((state) => state.proposals.getProposals)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([curve && fetchAllStoredUsdRates(curve), getProposals(), getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )
}

export const BaseLayout = ({
  children,
  networkName,
  chainId,
}: {
  children: ReactNode
  networkName: NetworkEnum
  chainId: ChainId
}) => {
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const [, globalAlertHeight] = useResizeObserver(globalAlertRef) ?? []
  const [, setWalletChain] = useSetChain()

  const { connectState, lib } = useConnection<CurveApi>()
  const layoutHeight = useStore((state) => state.layoutHeight)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
  useAutoRefresh(lib)

  useEffect(() => {
    updateLayoutHeight('globalAlert', globalAlertHeight ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalAlertHeight])

  // Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
  const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

  const minHeight = useMemo(
    () => Object.values(layoutHeight).reduce((acc, height) => acc + height, 0) - layoutHeight.footer + 24,
    [layoutHeight],
  )

  const sections = useMemo(() => getSections(), [])
  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header
        chainId={chainId}
        sections={sections}
        BannerProps={{
          ref: globalAlertRef,
          networkName,
          showConnectApiErrorMessage: isFailure(connectState, CONNECT_STAGE.CONNECT_API),
          showSwitchNetworkMessage: isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK),
          maintenanceMessage,
          handleNetworkChange: () => setWalletChain({ chainId: ethers.toQuantity(chainId) }),
        }}
      />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="dao" networkName={networkName} headerHeight={useHeaderHeight(bannerHeight)} />
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
