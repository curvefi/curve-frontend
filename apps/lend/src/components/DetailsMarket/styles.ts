import Box from '@/ui/Box'
import { breakpoints } from '@/ui/utils'
import styled from 'styled-components'


export const SubTitle = styled.h3`
  font-size: var(--font-size-3);
  margin-bottom: var(--spacing-1);
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
    }
  }}
`

export const Wrapper = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
    display: grid;
    grid-template-columns: 1fr 300px;
    min-height: 14.6875rem;
  }
`

export const ContentStats = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
    align-items: flex-start;
    display: flex;
    margin-bottom: var(--spacing-normal);
  }
`

export const ContentWrapper = styled.div<{ paddingTop?: boolean; isBorderBottom?: boolean }>`
  > ${ContentStats}:not(:last-of-type) {
    margin-bottom: var(--spacing-narrow);
  }

  padding: var(--spacing-normal) var(--spacing-narrow);
  ${({ paddingTop }) => paddingTop && `padding-top: var(--spacing-wide);`}

  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return `border-bottom: 1px solid var(--border-600);`
    }
  }};

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-normal);
    padding-right: var(--spacing-normal);
  }
`

export const DarkContent = styled(ContentWrapper)`
  background-color: var(--box--secondary--content--background-color);
  padding: var(--spacing-narrow);
  padding-bottom: var(--spacing-normal);
  padding-top: var(--spacing-wide);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-normal);
    padding-right: var(--spacing-normal);
  }
`
