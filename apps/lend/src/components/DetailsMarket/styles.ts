import styled from 'styled-components'

import { breakpoints } from '@/ui/utils'
import Box from '@/ui/Box'

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

export const ContentStat = styled.div<{ isRow?: boolean }>`
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-narrow);

  &.isRow {
    display: grid;
    grid-gap: var(--spacing-1);
    margin-right: var(--spacing-wide);
    margin-top: var(--spacing-3);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    display: grid;
    grid-gap: var(--spacing-1);
    margin-right: var(--spacing-wide);

    &.isRow {
      margin-top: 0;
    }
  }
`

export const ContentStats = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
    align-items: flex-start;
    display: flex;
    margin-bottom: var(--spacing-normal);
  }
`

export const Content = styled.div<{ paddingTop?: boolean; isBorderBottom?: boolean }>`
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

export const ContentStatTitle = styled.span`
  font-size: var(--font-size-1);
  font-weight: bold;
  text-transform: uppercase;
  white-space: nowrap;
`

export const ContentStatValue = styled.span`
  font-weight: bold;
`

export const DarkContent = styled(Content)`
  background-color: var(--box--secondary--content--background-color);
  padding: var(--spacing-narrow);
  padding-bottom: var(--spacing-normal);
  padding-top: var(--spacing-wide);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: var(--spacing-normal);
    padding-right: var(--spacing-normal);
  }
`
