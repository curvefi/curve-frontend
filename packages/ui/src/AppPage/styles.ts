import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Box } from '@ui/Box'
import type { BoxProps } from '@ui/Box/types'
import { breakpoints } from '@ui/utils'

// PAGE STYLES WITH FORMS
type AppPageFormContainerProps = { isAdvanceMode: boolean }

export const AppPageFormContainer: IStyledComponent<'web', AppPageFormContainerProps & ComponentPropsWithRef<'div'>> =
  styled.div<AppPageFormContainerProps>`
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

export const AppPageFormTitleWrapper: IStyledComponent<'web', ComponentPropsWithRef<'header'>> = styled.header`
  align-items: center;
  color: var(--page--text-color);
  display: inline-flex;
  padding-top: 1rem;
  padding-left: 1rem;
  padding-bottom: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    padding-left: 0;
    padding-bottom: 0;
  }
`

type TabContentWrapperProps = BoxProps & { variant?: 'secondary' }

const TabContentWrapper: IStyledComponent<'web', TabContentWrapperProps & ComponentPropsWithRef<'div'>> = styled(
  Box,
)<TabContentWrapperProps>`
  background-color: ${({ variant }) =>
    variant === 'secondary'
      ? `var(--tab-secondary--content--background-color)`
      : `var(--tab--content--background-color)`};
`

export const AppPageInfoContentWrapper: IStyledComponent<'web', TabContentWrapperProps & ComponentPropsWithRef<'div'>> =
  styled(TabContentWrapper)`
    min-height: 14.6875rem; // 235px
    position: relative;
  `
