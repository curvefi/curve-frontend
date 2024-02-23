import styled from 'styled-components'
import { breakpoints } from '@/ui/utils'
import TextEllipsis from '@/ui/TextEllipsis'
import Box from '@/ui/Box'
import TabContentWrapper from '@/ui/Tab/TabContentWrapper'
import BoxHeader from '@/ui/Box/BoxHeader'

// TODO: move to UI Packages
// PAGE STYLES
export const PageContainer = styled.div`
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
export const PageFormContainer = styled.div<{ isAdvanceMode: boolean }>`
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

export const PageFormsWrapper = styled(Box)<{ navHeight: number }>`
  margin-bottom: 2rem;

  @media (min-width: ${breakpoints.md}rem) {
    align-self: flex-start;
    min-width: var(--loan-form-min-width);
    max-width: var(--loan-form-min-width);
    //position: sticky;
    top: ${({ navHeight }) => `${navHeight + 40}px;`};
  }
`

export const PageFormTitleWrapper = styled.header`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  min-height: 46px;
  padding: var(--spacing-narrow);
  padding-top: var(--spacing-wide);

  @media (min-width: ${breakpoints.sm}rem) {
    padding-top: var(--spacing-normal);
    padding-left: 0;
  }
`

export const PageFormTitleContent = styled(TextEllipsis)`
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

export const PageFormTitleLinks = styled.div`
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

export const PageInfoWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1.5rem;
  }
`

export const PageInfoTabsWrapper = styled.header`
  display: flex;
  justify-content: space-between;

  background-color: var(--box_header--primary--background-color);
  border-bottom: var(--box_header--border);
`

export const PageInfoContentWrapper = styled(TabContentWrapper)`
  min-height: 14.6875rem; // 235px
  position: relative;
`

export const PageInfoContentHeader = styled(BoxHeader)`
  padding-left: 1rem;
`
