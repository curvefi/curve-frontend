'use client'
import styled from 'styled-components'
import Proposal from '@/dao/components/PageProposal/index'
import usePageOnMount from '@/dao/hooks/usePageOnMount'
import type { ProposalUrlParams } from '@/dao/types/dao.types'
import { breakpoints } from '@ui/utils'

const Page = (props: ProposalUrlParams) => {
  const { routerParams } = usePageOnMount()
  const { rChainId } = routerParams

  return (
    <>
      <Container>
        <Proposal routerParams={props} rChainId={rChainId} />
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
