'use client'
import styled from 'styled-components'
import { DeployGauge } from '@/dex/components/PageDeployGauge/index'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { breakpoints } from '@ui/utils/responsive'

export const PageDeployGauge = (props: NetworkUrlParams) => (
  <Container>
    <DeployGauge {...props} />
  </Container>
)

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
