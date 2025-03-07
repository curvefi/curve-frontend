'use client'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils'
import usePageOnMount from '@/dao/hooks/usePageOnMount'
import Proposal from '@/dao/components/PageProposal/index'
import type { ProposalUrlParams } from '@/dao/types/dao.types'

const Page = (props: ProposalUrlParams) => {
  usePageOnMount()
  return (
    <>
      <Container>
        <Proposal routerParams={props} />
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
