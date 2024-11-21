import type { PageWidth } from 'ui/src/AppNav/types'

import styled, { css } from 'styled-components'

import { breakpoints } from 'ui/src/utils'

import SelectNetwork from 'ui/src/SelectNetwork'

export const AppNavSecondaryWrapper = styled.nav`
  border-bottom: 1px solid var(--nav--border-color);
  font-size: var(--font-size-2);
  font-weight: bold;
  //position: sticky;
  top: 0;

  color: var(--nav--color);
  background-color: var(--page--header--background-color);
  z-index: var(--z-index-page--top-nav);
`

export const AppNavBar = styled.nav<{ isMdUp: boolean }>`
  align-items: stretch;
  display: flex;
  background-color: var(--page--header--background-color);
  box-shadow: 0 2px 3px 0 rgb(0 0 0 / 20%);
  color: var(--nav--color);
  font-size: var(--font-size-2);
  height: var(--header-height);
  text-transform: uppercase;
  top: ${({ isMdUp }) => (isMdUp ? 'var(--top-nav-bottom)' : '0')};
  z-index: var(--z-index-page-nav);
`

export const AppNavBarContent = styled.div<{ pageWidth: PageWidth }>`
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-narrow) 0 0;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    padding: 0 var(--spacing-normal);
  }
`

export const AppNavMenuSection = styled.div<{ gridColumnGap?: string }>`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: var(--spacing-2);

  @media (min-width: ${breakpoints.md}rem) {
    grid-column-gap: ${({ gridColumnGap }) => gridColumnGap ?? 'var(--spacing-3)'};
  }
`

const linkCss = css`
  align-items: center;
  color: inherit;
  cursor: pointer;
  display: flex;
  font-weight: var(--font-weight--bold);
  padding: 0 0.5rem;
  text-decoration: none;

  :active {
    transform: none;
  }

  :hover {
    color: var(--nav_link--hover--color);
    background-color: var(--nav_link--hover--background-color);
  }

  &.active,
  &.active:hover {
    color: var(--nav_link--active--hover--color);
    background-color: var(--nav_link--active--hover--background-color);
  }
`

export const AppExternalLink = styled.a.attrs(() => ({
  target: '_blank',
  rel: 'noreferrer noopener',
}))`
  ${linkCss};
`

export const AppLinkText = styled.a`
  ${linkCss};
`

export const AppSelectNetwork = styled(SelectNetwork)`
  && {
    height: var(--height-medium);
  }
`
