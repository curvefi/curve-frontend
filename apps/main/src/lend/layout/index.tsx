import { useParams } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ROUTE } from '@/lend/constants'
import { Header } from '@/lend/layout/Header'
import { layoutHeightKeys } from '@/lend/store/createLayoutSlice'
import useStore from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import { getPath } from '@/lend/utils/utilsRouter'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { isChinese, t } from '@ui-kit/lib/i18n'
import { Footer } from '@ui-kit/widgets/Footer'
import { useHeaderHeight } from '@ui-kit/widgets/Header'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'
import { networksIdMapper } from '../networks'

const BaseLayout = ({ children }: { children: ReactNode }) => {
  const globalAlertRef = useRef<HTMLDivElement>(null)
  const [, elHeight] = useResizeObserver(globalAlertRef) ?? []
  const footerRef = useRef<HTMLDivElement>(null)
  const [, footerHeight] = useResizeObserver(footerRef) ?? []
  const params = useParams() as UrlParams
  const { network: networkId } = params
  const layoutHeight = useStore((state) => state.layout.height)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const minHeight = useMemo(() => layoutHeightKeys.reduce((total, key) => total + layoutHeight[key], 0), [layoutHeight])

  useEffect(() => {
    setLayoutHeight('globalAlert', elHeight ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  useEffect(() => {
    setLayoutHeight('footer', footerHeight ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerHeight])

  const sections = useMemo(() => getSections(params), [params])
  const chainId = networksIdMapper[networkId]

  return (
    <Container globalAlertHeight={layoutHeight?.globalAlert}>
      <Header chainId={chainId} sections={sections} globalAlertRef={globalAlertRef} networkId={networkId} />
      <Main minHeight={minHeight}>{children}</Main>
      <Footer appName="lend" networkId={networkId} headerHeight={useHeaderHeight(bannerHeight)} />
    </Container>
  )
}

const getSections = ({ network }: UrlParams): NavigationSection[] => [
  {
    title: t`Documentation`,
    links: [
      { href: 'https://news.curve.fi/', label: t`News` },
      { href: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { href: 'https://docs.curve.fi', label: t`Developer Resources` },
      { href: getPath({ network }, `${ROUTE.PAGE_DISCLAIMER}?tab=lend`), label: t`Risk Disclaimers` },
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
