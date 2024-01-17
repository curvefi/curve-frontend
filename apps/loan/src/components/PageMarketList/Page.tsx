import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { parseParams } from '@/utils/utilsRouter'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import DocumentHead from '@/layout/DocumentHead'
import CollateralList from '@/components/PageMarketList/index'
import Settings from '@/layout/Settings'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const pageLoaded = usePageOnMount(params, location, navigate)
  const { rChainId } = parseParams(params, location)

  const curve = useStore((state) => state.curve)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Markets`} />
      <Container>
        {pageLoaded && params && rChainId && <CollateralList params={params} rChainId={rChainId} curve={curve} />}
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;
  padding-top: 0.5rem; // 8px
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
    margin-top: 3rem;
  }
`

export default Page
