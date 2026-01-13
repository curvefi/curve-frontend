import { styled } from 'styled-components'
import { UserPage } from '@/dao/components/PageUser/index'
import type { UserUrlParams } from '@/dao/types/dao.types'
import { breakpoints } from '@ui/utils'
import { useParams } from '@ui-kit/hooks/router'

export const PageUser = () => {
  const params = useParams<UserUrlParams>()
  return (
    <Container data-testid="user-page">
      <UserPage routerParams={params} />
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
