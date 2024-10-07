import { breakpoints } from '@/ui/utils/responsive'
import { t } from '@lingui/macro'
import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'


import PoolCreation from '@/components/PageRiskDisclaimer/index'
import usePageOnMount from '@/hooks/usePageOnMount'
import DocumentHead from '@/layout/default/DocumentHead'

import { scrollToTop } from '@/utils'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { curve } = usePageOnMount(params, location, navigate)

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Risk Disclaimer`} />
      <Container>
        <PoolCreation />
      </Container>
    </>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;

  @media (min-width: 46.875rem) {
    margin: 1.5rem 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

export default Page
