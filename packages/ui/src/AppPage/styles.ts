import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Box } from '@ui/Box'
import type { BoxProps } from '@ui/Box/types'

// PAGE STYLES WITH FORMS

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
