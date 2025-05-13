import { ReactNode, useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ROUTE } from '@/dex/constants'
import useLayoutHeight from '@/dex/hooks/useLayoutHeight'
import Header from '@/dex/layout/default/Header'
import curvejsApi from '@/dex/lib/curvejs'
import { layoutHeightKeys } from '@/dex/store/createGlobalSlice'
import useStore from '@/dex/store/useStore'
import type { CurveApi, NetworkConfig } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { useConnection } from '@ui-kit/features/connect-wallet'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { Footer } from '@ui-kit/widgets/Footer'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'

const useAutoRefresh = (network: NetworkConfig) => {
  const { lib: curve } = useConnection<CurveApi>()

  const isPageVisible = useStore((state) => state.isPageVisible)
  const fetchPools = useStore((state) => state.pools.fetchPools)
  const poolDataMapper = useStore((state) => state.pools.poolsMapper[network.chainId])
  const fetchPoolsVolume = useStore((state) => state.pools.fetchPoolsVolume)
  const fetchPoolsTvl = useStore((state) => state.pools.fetchPoolsTvl)
  const setTokensMapper = useStore((state) => state.tokens.setTokensMapper)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const fetchAllStoredBalances = useStore((state) => state.userBalances.fetchAllStoredBalances)

  const fetchPoolsVolumeTvl = useCallback(
    async (curve: CurveApi) => {
      const { chainId } = curve
      const poolDatas = Object.values(poolDataMapper)
      await Promise.all([fetchPoolsVolume(chainId, poolDatas), fetchPoolsTvl(curve, poolDatas)])
      void setTokensMapper(chainId, poolDatas)
    },
    [fetchPoolsTvl, fetchPoolsVolume, poolDataMapper, setTokensMapper],
  )

  const refetchPools = useCallback(
    async (curve: CurveApi) => {
      const poolIds = await curvejsApi.network.fetchAllPoolsList(curve, network)
      void fetchPools(curve, poolIds, null)
    },
    [fetchPools, network],
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        void fetchGasInfo(curve)
        void fetchAllStoredUsdRates(curve)
        void fetchPoolsVolumeTvl(curve)

        if (curve.signerAddress) {
          void fetchAllStoredBalances(curve)
        }
      }
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  usePageVisibleInterval(
    () => {
      if (curve) {
        void refetchPools(curve)
      }
    },
    REFRESH_INTERVAL['11m'],
    isPageVisible,
  )
}

const BaseLayout = ({ children, network }: { children: ReactNode } & { network: NetworkConfig }) => {
  const globalAlertRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert')
  useAutoRefresh(network)

  const layoutHeight = useStore((state) => state.layoutHeight)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)

  const sections = useMemo(() => getSections(network.id), [network.id])
  const minHeight = useMemo(() => layoutHeightKeys.reduce((total, key) => total + layoutHeight[key], 0), [layoutHeight])

  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header sections={sections} globalAlertRef={globalAlertRef} networkId={network.id} />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="dex" networkId={network.id} headerHeight={useHeaderHeight(bannerHeight)} />
    </Container>
  )
}

const getSections = (network: string): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: 'https://news.curve.finance/', label: t`News` },
      { href: 'https://resources.curve.finance/lending/understanding-lending/', label: t`User Resources` },
      { href: 'https://docs.curve.finance', label: t`Developer Resources` },
      { href: getPath({ network }, ROUTE.PAGE_DISCLAIMER), label: t`Risk Disclaimers` },
      { href: getPath({ network }, ROUTE.PAGE_INTEGRATIONS), label: t`Integrations` },
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
`

const Container = styled.div<{ globalAlertHeight: number }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: ${({ globalAlertHeight }) => `calc(100vh - ${globalAlertHeight}px)`};
`

export default BaseLayout
