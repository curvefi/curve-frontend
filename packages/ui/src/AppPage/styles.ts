import { styled } from 'styled-components'
import Box from 'ui/src/Box'
import { breakpoints } from 'ui/src/utils'

// PAGE STYLES WITH FORMS
export const AppPageFormContainer = styled.div<{ isAdvanceMode: boolean }>`
  @media (min-width: 425px) {
    margin-top: var(--spacing-normal);
    margin-left: 1rem;
    margin-right: 1rem;
  }
  @media (min-width: 650px) {
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

export const AppPageFormsWrapper = styled(Box)`
  margin-bottom: 2rem;

  @media (min-width: ${breakpoints.md}rem) {
    align-self: flex-start;
  }
`

export const AppPageFormTitleWrapper = styled.header`
  align-items: center;
  color: var(--page--text-color);
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

export const AppPageInfoWrapper = styled.div`
  margin-bottom: 2rem;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    margin-left: 1.5rem;
  }
`

const TabContentWrapper = styled(Box)<{ variant?: 'secondary' }>`
  background-color: ${({ variant }) =>
    variant === 'secondary'
      ? `var(--tab-secondary--content--background-color)`
      : `var(--tab--content--background-color)`};
`

export const AppPageInfoContentWrapper = styled(TabContentWrapper)`
  min-height: 14.6875rem; // 235px
  position: relative;
`
