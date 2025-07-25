'use client'
import { styled } from 'styled-components'
import UserPage from '@/dao/components/PageUser/index'
import type { UserUrlParams } from '@/dao/types/dao.types'
import { breakpoints } from '@ui/utils'

export const PageUser = (props: UserUrlParams) => (
  <Container>
    <UserPage routerParams={props} />
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
