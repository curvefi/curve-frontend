import { css } from 'styled-components'
import type { LinkSize, LinkVariant } from '@ui/Link/types'
import { focusVisible } from '@ui/utils/sharedStyles'

export type LinkProps = {
  className?: string
  active?: boolean
  isDarkBg?: boolean
  $noStyles?: boolean
  size?: LinkSize
  variant?: LinkVariant
}

export const linkStyles = css<LinkProps>`
  ${focusVisible};

  color: var(--link--color);
  font: var(--link--font-weight) var(--link--font);
  text-decoration: underline;

  transition: color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    color: var(--link--hover--color);
    text-decoration-color: var(--link--underline--hover-color);
  }

  &.active,
  &.active:hover {
    color: var(--link--active-color);
    background-color: var(--active--background-color);
  }

  ${({ size }) => {
    if (size === 'small') {
      return `
        min-height: var(--height-small);
        padding: 0 var(--spacing-2);
        font-size: var(--font-size-2);
      `
    }
  }}

  ${({ variant }) => {
    if (variant === 'contained') {
      return `
        &:active {
          box-shadow: none;
          transform: translate3d(3px, 3px, 3px);
        }
    
        &:hover {
          color: var(--link_contained--color);
          background-color: var(--link_contained--background-color);
          text-decoration-color: var(--link_contained--underline-color);
        }
      `
    }
  }}

  ${({ isDarkBg }) => {
    if (isDarkBg) {
      return `
        color: var(--link_light--color);

        &:hover {
          color: var(--link_light--hover--color);
          text-decoration-color: var(--link_light--hover--color);
        }
      `
    }
  }}

  ${({ $noStyles }) => {
    if ($noStyles) {
      return `
        color: inherit;
        text-transform: inherit;
        
        &:hover {
          color: inherit;
          text-decoration: inherit;
        }
      `
    }
  }}
`
