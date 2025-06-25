import { ReactNode, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Header } from '@/dao/layout/Header'
import useStore from '@/dao/store/useStore'
import type { ChainId, NetworkEnum } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils/utilsRouter'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { useLayoutHeight } from '@ui-kit/hooks/useResizeObserver'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { Footer } from '@ui-kit/widgets/Footer'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

const useAutoRefresh = () => {
  const { curveApi } = useConnection()
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([curveApi && fetchAllStoredUsdRates(curveApi), getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )
}

export const BaseLayout = ({
  children,
  networkId,
  chainId,
}: {
  children: ReactNode
  networkId: NetworkEnum
  chainId: ChainId
}) => {
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const setLayoutHeight = useLayoutStore((state) => state.setLayoutHeight)
  useLayoutHeight(globalAlertRef, 'globalAlert', setLayoutHeight)

  const layoutHeight = useLayoutStore((state) => state.height)
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)
  useAutoRefresh()

  const minHeight = useMemo(
    () => Object.values(layoutHeight).reduce((acc, height) => acc + height, 0) - layoutHeight.footer + 24,
    [layoutHeight],
  )

  const sections = useMemo(() => getSections(), [])
  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header chainId={chainId} sections={sections} globalAlertRef={globalAlertRef} networkId={networkId} />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="dao" networkId={networkId} headerHeight={useHeaderHeight(bannerHeight)} />
    </Container>
  )
}

const getSections = (): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: 'https://news.curve.finance/', label: t`News` },
      { href: 'https://resources.curve.finance/lending/understanding-lending/', label: t`User Resources` },
      { href: 'https://docs.curve.finance', label: t`Developer Resources` },
      { href: getEthPath(DAO_ROUTES.PAGE_DISCLAIMER), label: t`Risk Disclaimers` },
      { href: 'https://resources.curve.finance/glossary-branding/branding/', label: t`Branding` },
      ...(isChinese() ? [{ href: 'https://www.curve.wiki/', label: t`Wiki` }] : []),
    ],
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { href: 'https://docs.curve.finance/references/audits/', label: t`Audits` },
      { href: 'https://docs.curve.finance/security/security/', label: t`Bug Bounty` },
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
