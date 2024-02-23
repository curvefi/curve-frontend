import React from 'react'
import styled from 'styled-components'
import { breakpoints } from '@/ui/utils'

const Beta = () => (
  <div>
    <Wrapper>Beta</Wrapper>
  </div>
)

const Wrapper = styled.span`
  background-color: var(--warning-400);
  font-size: var(--font-size-1);
  font-weight: bold;
  padding: 2px var(--spacing-1);
  margin-left: 33px;

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-1) var(--spacing-2);
    margin-left: var(--spacing-1);
    margin-right: var(--spacing-narrow);
    margin-top: 2px;
  }
`

export default Beta
