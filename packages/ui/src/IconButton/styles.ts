import { styled } from 'styled-components'
import { focusVisible } from '@ui/utils/sharedStyles'
import type { IconButtonProps } from './types'

export const StyledIconButton = styled.button<Omit<IconButtonProps, 'className'>>`
  ${focusVisible};

  align-items: center;
  display: flex;
  justify-content: center;
  padding: ${({ padding }) => `var(--spacing-${padding || '0'})`};

  color: inherit;
  background-color: transparent;
  border: none;

  cursor: pointer;

  opacity: ${({ opacity }) => opacity || 0.6};
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover {
    opacity: 1;
  }

  ${({ size }) => {
    if (size === 'small') {
      return `
        min-height: var(--height-small);
        min-width: var(--height-small);
      `
    } else if (size === 'medium') {
      return `
        min-height: var(--height-medium);
        min-width: var(--height-medium);
      `
    } else if (size === 'large') {
      return `
        min-height: var(--height-large);
        min-width: var(--height-large);
      `
    }
  }}

  ${({ hidden }) => {
    if (hidden) {
      return 'visibility: hidden;'
    }
  }}
`
