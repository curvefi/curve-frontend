import { css } from 'styled-components'

export const focusVisible = css`
  &:focus:not(.focus-visible) {
    outline: none;
  }

  &.focus-visible {
    outline: 2px solid var(--focus);
    z-index: 1;
  }
`
