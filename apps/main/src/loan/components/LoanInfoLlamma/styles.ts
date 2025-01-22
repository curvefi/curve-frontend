import styled from 'styled-components'

import { breakpoints } from '@ui/utils'
import Box from '@ui/Box'

export const SubTitle = styled.h3`
  font-size: var(--font-size-3);
  margin-bottom: 0.75rem; // 12px
`

export type StatsProps = {
  isBorderBottom?: boolean
  isMultiLine?: boolean
  padding?: boolean
}

export const StyledStats = styled(Box)<StatsProps>`
  align-items: center;
  display: flex;
  justify-content: space-between;

  ${({ padding }) => {
    if (padding) {
      return 'padding: 0.25rem 0;'
    }
  }}

  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return 'border-bottom: 1px solid var(--border-600);'
    }
  }}
  
  ${({ isMultiLine }) => {
    if (isMultiLine) {
      return `
        align-items: flex-start;
        flex-direction: column;
      `
    } else {
      return `
        @media (min-width: ${breakpoints.sm}rem) {
          > *:first-of-type {
            margin-right: 1rem;
          }
        }
      `
    }
  }}
`
