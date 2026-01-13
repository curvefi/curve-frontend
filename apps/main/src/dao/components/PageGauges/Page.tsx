import { styled } from 'styled-components'
import { Gauges } from '@/dao/components/PageGauges/index'
import { breakpoints } from '@ui/utils'

export const PageGauges = () => (
  <Container data-testid="gauges-page">
    <Gauges />
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
