'use client'
import styled from 'styled-components'
import { breakpoints } from '@ui/utils'
import usePageOnMount from '@/dao/hooks/usePageOnMount'
import UserPage from '@/dao/components/PageUser/index'
import type { UserUrlParams } from '@/dao/types/dao.types'

const Page = (props: UserUrlParams) => {
  usePageOnMount()
  return (
    <>
      <Container>
        <UserPage routerParams={props} />
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
