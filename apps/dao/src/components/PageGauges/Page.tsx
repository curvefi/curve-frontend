import type { NextPage } from 'next'

import React, { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints, scrollToTop } from '@/ui/utils'
import usePageOnMount from '@/hooks/usePageOnMount'

import Gauges from '@/components/PageGauges/index'
import DocumentHead from '@/layout/DocumentHead'
import Settings from '@/layout/Settings'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title="Gauges" />
      <Container>
        {rChainId ? (
          <Gauges />
        ) : (
          <SpinnerWrapper minHeight="50vh">
            <Spinner />
          </SpinnerWrapper>
        )}
      </Container>
      <Settings showScrollButton />
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
