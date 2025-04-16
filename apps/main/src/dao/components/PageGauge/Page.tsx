'use client'
import styled from 'styled-components'
import Gauge from '@/dao/components/PageGauge/index'
import { usePageOnMount } from '@/dao/hooks/usePageOnMount'
import type { GaugeUrlParams } from '@/dao/types/dao.types'
import { breakpoints } from '@ui/utils'

const Page = (params: GaugeUrlParams) => {
  usePageOnMount()
  return (
    <Container>
      <Gauge routerParams={params} />
    </Container>
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
