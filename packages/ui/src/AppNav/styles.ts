import styled, { css } from 'styled-components'

export const AppNavSecondaryWrapper = styled.nav`
  border-bottom: 1px solid var(--nav--border-color);
  font-size: var(--font-size-2);
  font-weight: bold;
  //position: sticky;
  top: 0;

  color: var(--nav--color);
  background-color: var(--page--background-color);
  z-index: var(--z-index-page--top-nav);
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

export const AppLinkText = styled.a`
  ${linkCss};
`
