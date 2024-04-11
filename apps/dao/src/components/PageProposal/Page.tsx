import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { breakpoints, scrollToTop } from '@/ui/utils'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import Proposal from '@/components/PageProposal/index'
import DocumentHead from '@/layout/DocumentHead'
import Settings from '@/layout/Settings'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId, rProposalId } = routerParams

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <>
      <DocumentHead title="" />
      <Container>
        <Proposal routerParams={{ rChainId, rProposalId }} />
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

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 15rem;
  max-height: 5rem;
  margin: 10rem auto auto;
  background: var(--page--background-color);
`

export default Page
