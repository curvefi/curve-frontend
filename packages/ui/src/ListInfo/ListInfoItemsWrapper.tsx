import { styled } from 'styled-components'
import { breakpoints } from 'ui/src/utils'

export const ListInfoItemsWrapper = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
    > ul {
      margin-bottom: var(--spacing-normal);
    }
  }
`
