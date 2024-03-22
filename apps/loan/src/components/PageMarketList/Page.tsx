import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'

import DocumentHead from '@/layout/DocumentHead'
import CollateralList from '@/components/PageMarketList/index'
import Settings from '@/layout/Settings'
import TableStats from '@/components/PageMarketList/components/TableStats'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, routerParams, curve } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Markets`} />
      <Container>
        <Content>
          {rChainId && <CollateralList pageLoaded={pageLoaded} params={params} rChainId={rChainId} curve={curve} />}
        </Content>
        {rChainId && <TableStats />}
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

  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: 2rem;
    padding-left: var(--spacing-narrow);
    padding-right: var(--spacing-narrow);
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin-top: 3rem;
  }
`

const Content = styled.div`
  background-color: var(--table--background-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
  border: 1px solid var(--box--secondary--border);
  min-height: 288px;
`

export default Page
