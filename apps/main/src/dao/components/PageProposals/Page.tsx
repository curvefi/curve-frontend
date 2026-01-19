import { styled } from 'styled-components'
import { Proposals } from '@/dao/components/PageProposals/index'
import { breakpoints } from '@ui/utils'

export const PageDao = () => (
  <Container>
    <Proposals />
  </Container>
)

const Container = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem 1.5rem 0 1.5rem;
  }
`
