import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils/responsive'
import Box from 'ui/src/Box'
import Button from 'ui/src/Button'
import Icon from 'ui/src/Icon'

export const PriceAndTradesExpandedContainer = styled(Box)`
  margin: 1.5rem 0 0;
  display: flex;
  @media (min-width: ${breakpoints.md}rem) {
    flex-direction: column;
  }
`

export const PriceAndTradesExpandedWrapper = styled(Box)`
  background-color: var(--tab-secondary--content--background-color);
`

export const ExpandButton = styled(Button)`
  margin: auto var(--spacing-3) auto auto;
  display: flex;
  align-content: center;
  color: inherit;
  font-size: var(--font-size-2);
`

export const ExpandIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`
