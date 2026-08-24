import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type StyledBtnProps = { $loading?: boolean }

export const StyledBtn: IStyledComponent<'web', StyledBtnProps & ComponentPropsWithRef<'button'>> =
  styled.button<StyledBtnProps>`
    align-items: center;
    background-color: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    font-size: var(--font-size-2);
    font-weight: bold;
    height: 100%;
    min-height: var(--height-medium);
    padding: 0 0.25rem 0 0.5rem;
    white-space: nowrap;

    &:disabled {
      cursor: initial;
      transition: none;
    }

    &:hover:not(:disabled) {
      color: var(--button_outlined--hover--color);
      border-color: var(--button_outlined--hover--color);
      background-color: var(--button_outlined--hover--background-color);
    }

    ${({ $loading }) => $loading && `opacity: 0.5;`}
  `
