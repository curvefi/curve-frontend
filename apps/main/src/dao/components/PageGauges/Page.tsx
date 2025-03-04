'use client'
import React from 'react'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils'
import usePageOnMount from '@/dao/hooks/usePageOnMount'
import Gauges from '@/dao/components/PageGauges/index'
import Settings from '@/dao/layout/Settings'

const Page = () => {
  usePageOnMount()
  return (
    <>
      <Container>
        <Gauges />
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
