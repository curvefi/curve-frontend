import styled from 'styled-components'


import Box from 'ui/src/Box'
import BoxHeader from 'ui/src/Box/BoxHeader'
import TabContentWrapper from 'ui/src/Tab/TabContentWrapper'
import TextEllipsis from 'ui/src/TextEllipsis'
import { breakpoints } from 'ui/src/utils'

// PAGE STYLES
export const AppPageContainer = styled.div`
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;
  padding-bottom: var(--spacing-normal);

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
    margin-top: 3rem;
    padding-bottom: 0;
  }
`

// PAGE STYLES WITH FORMS
export const AppPageFormContainer = styled.div<{ isAdvanceMode: boolean }>`
  @media (min-width: 425px) {
    margin-top: var(--spacing-normal);
    margin-left: 1rem;
    margin-right: 1rem;
  }
  @media (min-width: ${breakpoints.sm}rem) {
    margin-left: 3rem;
    margin-right: 3rem;
  }
  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1rem;
    margin-right: 1rem;
    ${({ isAdvanceMode }) => (isAdvanceMode ? `align-items: flex-start;` : `justify-content: center;`)};
    display: flex;
  }
`

export const AppPageFormsWrapper = styled(Box)<{ navHeight: number }>`
  margin-bottom: 2rem;

  @media (min-width: ${breakpoints.md}rem) {
    align-self: flex-start;
    min-width: var(--loan-form-min-width);
    max-width: var(--loan-form-min-width);
    //position: sticky;
    top: ${({ navHeight }) => `${navHeight + 40}px;`};
  }
`

export const AppPageFormTitleWrapper = styled.header`
  align-items: center;
  color: var(--nav--page--color);
  display: inline-flex;
  padding-top: var(--spacing-wide);
  padding-bottom: var(--spacing-2);
  padding-left: 1rem;
  min-height: 46px;

  @media (min-width: ${breakpoints.sm}rem) {
    padding-top: var(--spacing-normal);
    padding-left: 0;
  }
`

export const AppPageFormTitleContent = styled(TextEllipsis)`
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

export const AppPageFormTitleLinks = styled.div`
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;

  a.active {
    background-color: black;
  }
`

export const AppPageInfoWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1.5rem;
  }
`

export const AppPageInfoTabsWrapper = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
`

export const AppPageInfoContentWrapper = styled(TabContentWrapper)`
  min-height: 14.6875rem; // 235px
  position: relative;
`

export const AppPageInfoContentHeader = styled(BoxHeader)`
  padding-left: 1rem;
`
