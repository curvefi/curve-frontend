import { css } from 'styled-components'
import type { ButtonProps } from '@ui/Button/types'
import { focusVisible } from '@ui/utils/sharedStyles'

export const buttonFilledStyles = css`
  color: var(--button--color);
  background-color: var(--button--background-color);
  border: 1px solid var(--nav_button--border-color);
  box-shadow: 3px 3px 0 var(--button--shadow-color);

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:hover:not(:disabled):not(.loading) {
    background-color: var(--button_filled--hover--background-color);
  }

  &:active:not(:disabled) {
    box-shadow: none;
    transform: translate3d(3px, 3px, 3px);
  }

  &.loading,
  &:disabled {
    color: var(--button--disabled--color);
    border-color: var(--button--disabled--border-color);
    background-color: var(--button--disabled--background-color);
    box-shadow: none;
    cursor: initial;
  }
`

export const buttonSelectStyles = css`
  border: 1px solid var(--nav_button--border-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
  background: var(--layout--home--background-color);
  color: var(--page--text-color);

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  &.active:not(:disabled) {
    color: var(--button--color);
    background-color: var(--button--background-color);
    border: 1px solid var(--button--border-color);
    box-shadow: 3px 3px 0 var(--button--shadow-color);
  }
  &:hover:not(:disabled) {
    color: var(--button--color);
    border: 1px solid var(--button--border-color);
    background-color: var(--button_filled--hover--background-color);
  }
  &.loading,
  &:disabled {
    color: var(--button--disabled--color);
  }
`

export const buttonOutlinedStyles = css`
  color: var(--button_outlined--color);
  background-color: transparent;
  border: 1px solid var(--button_outlined--border-color);

  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  &:disabled {
    opacity: 0.5;
    cursor: initial;
    transition: none;
  }

  &:hover:not(:disabled) {
    color: var(--button_outlined--hover--color);
    border-color: var(--button_outlined--hover--color);
    background-color: var(--button_outlined--hover--background-color);
  }
`

export const buttonBaseStyles = css<ButtonProps>`
  ${focusVisible};

  padding: var(--spacing-1) var(--spacing-2);

  font-size: inherit;
  font-weight: var(--button--font-weight);
  font-family: var(--button--font);
  text-transform: var(--button--text-transform);
  line-height: 1.2;

  &.loading {
    position: relative;
  }

  &:not(:disabled) {
    cursor: pointer;
  }

  ${({ nowrap }) => {
    if (nowrap) {
      return 'white-space: nowrap;'
    }
  }}

  ${({ size }) => {
    if (size === 'small') {
      return `
        min-height: var(--height-small);
        font-size: var(--font-size-2);
        text-transform: uppercase;
      `
    } else if (size === 'medium') {
      return `
        min-height: var(--height-medium);
      `
    } else if (size === 'large') {
      return `
        min-height: var(--height-large);
        font-size: var(--box_action--button--font-size);
      `
    } else if (size === 'x-large') {
      return `
        min-height: var(--height-x-large);
        font-size: var(--box_action--button--font-size);
      `
    }
  }}

  ${({ fillWidth }) => {
    if (fillWidth) {
      return 'width: 100%;'
    }
  }}

  ${({ variant, fillWidth }) => {
    if (variant === 'filled') {
      return `
        ${buttonFilledStyles}
      `
    } else if (variant === 'icon-filled') {
      return `
        align-items: center;
        display: ${fillWidth ? 'flex' : 'inline-flex'};
        justify-content: center;

        ${buttonFilledStyles}
      `
    } else if (variant === 'outlined') {
      return `${buttonOutlinedStyles}`
    } else if (variant === 'icon-outlined') {
      return `
        ${buttonOutlinedStyles}

        align-items: center;
        display: ${fillWidth ? 'flex' : 'inline-flex'};
      `
    } else if (variant === 'text') {
      return `
        color: var(--button_text--color);
        background-color: transparent;
        border: none;
      
        transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        
        &:hover:not(:disabled),
        &:active:not(:disabled) {
          color: var(--button_text--hover--color);
          background-color: var(--button_outlined--hover--background-color);
        }

        &.loading,
        &:disabled {
          color: var(--button--disabled--color);
        }
      `
    } else if (variant === 'select') {
      return `
        border: 1px solid var(--button_outlined--border-color);
        box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
        background: var(--layout--home--background-color);
        color: var(--page--text-color);

        transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        &.active:not(:disabled) {
          color: var(--button--color);
          background-color: var(--button--background-color);
          border: 1px solid var(--nav_button--border-color);
          box-shadow: 3px 3px 0 var(--button--shadow-color);
        }
        &:hover:not(:disabled) {
          color: var(--button--color); 
          border: 1px solid var(--nav_button--border-color);
          background-color: var(--button_filled--hover--background-color);
        }
        &.loading,
        &:disabled {
          color: var(--button--disabled--color);
        }
      `
    } else if (variant === 'select-flat') {
      return `
        ${buttonSelectStyles}
        box-shadow: none;
        &.active:not(:disabled) {
          box-shadow: none;
          border: 1px solid var(--button_outlined--border-color);
        }
      `
    }
  }}
`
