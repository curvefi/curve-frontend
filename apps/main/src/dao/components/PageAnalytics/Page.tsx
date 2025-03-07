'use client'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils'
import usePageOnMount from '@/dao/hooks/usePageOnMount'
import Analytics from '@/dao/components/PageAnalytics/index'

const Page = () => {
  usePageOnMount()
  return (
    <Container>
      <Analytics />
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
