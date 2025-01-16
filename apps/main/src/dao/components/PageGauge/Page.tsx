import type { NextPage } from 'next'

import { useEffect } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import { scrollToTop } from '@/utils'
import usePageOnMount from '@/hooks/usePageOnMount'

import Gauge from '@/components/PageGauge/index'
import DocumentHead from '@/layout/DocumentHead'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams } = usePageOnMount(params, location, navigate)
  const { rGaugeAddress } = routerParams

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={t`Gauge - ${rGaugeAddress}`} />
      <Container>
        <Gauge routerParams={{ rGaugeAddress }} />
      </Container>
    </>
  )
}

const Container = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem 1.5rem 0 1.5rem;
  }
`

export default Page
