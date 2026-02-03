import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import type { InputProps } from './types'

type StyledInputProps = Pick<InputProps, 'variant' | 'minHeight'>

export const StyledInput: IStyledComponent<'web', StyledInputProps & ComponentPropsWithRef<'input'>> =
  styled.input<StyledInputProps>`
    width: 100%;

    background-color: transparent;

    &:-webkit-autofill,
    &:-webkit-autofill:focus {
      -webkit-text-fill-color: var(--input--color) !important;
      transition:
        background-color 600000s 0s,
        color 600000s 0s;
    }

    input[data-autocompleted] {
      background-color: transparent !important;
    }

    font-size: var(--input--font-size);
    ${({ variant }) =>
      variant === 'small' &&
      `
    font-size: var(--font-size-2);
  `}

    color: inherit;

    &:disabled {
      -webkit-text-fill-color: var(--input--disabled--color);
      opacity: 1;
    }

    &:focus,
    &:focus:not(.focus-visible) {
      outline: none;
    }

    &::placeholder,
    &::-webkit-input-placeholder {
      font-weight: 400;
    }

    &:-ms-input-placeholder {
      font-weight: 400;
    }

    &[type='search']::-webkit-search-cancel-button {
      margin-left: var(--spacing-1);
    }

    &[type='search']::-webkit-search-decoration,
    &[type='search']::-webkit-search-results-button,
    &[type='search']::-webkit-search-results-decoration,
    &[type='search']::-webkit-search-cancel-button {
      display: none;
    }

    &[type='number']::-webkit-inner-spin-button,
    &[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type='number'] {
      -moz-appearance: textfield;
    }

    ${({ minHeight }) => {
      if (minHeight) {
        return `min-height: var(--height-${minHeight});`
      }
    }}
  `
