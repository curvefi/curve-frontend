import styled from 'styled-components'
import Box from 'ui/src/Box/Box'

const TabContentWrapper = styled(Box)<{ variant?: 'secondary' }>`
  background-color: ${({ variant }) =>
    variant === 'secondary'
      ? `var(--tab-secondary--content--background-color)`
      : `var(--tab--content--background-color)`};
`

export default TabContentWrapper
