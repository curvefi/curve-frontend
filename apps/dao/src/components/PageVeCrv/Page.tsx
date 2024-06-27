import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints, scrollToTop } from '@/ui/utils'
import usePageOnMount from '@/hooks/usePageOnMount'

import VeCrv from '@/components/PageVeCrv/index'
import DocumentHead from '@/layout/DocumentHead'

const Page: NextPage = () => {
  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title={'veCRV'} />
      <Container>
        <VeCrv />
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
