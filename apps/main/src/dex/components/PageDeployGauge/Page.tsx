import type { NextPage } from 'next'

import { t } from '@ui-kit/lib/i18n'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'

import DocumentHead from '@/dex/layout/default/DocumentHead'
import DeployGauge from '@/dex/components/PageDeployGauge/index'

import { scrollToTop } from '@/dex/utils'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import { CurveApi } from '@/dex/types/main.types'

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
      <DocumentHead title={t`Deploy Gauge`} />
      <Container>
        <DeployGauge curve={curve as CurveApi} />
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
