import { styled } from 'styled-components'
import { breakpoints } from '@ui/utils/responsive'

export const TheadButton = styled.button<{ nowrap?: boolean }>`
  background-color: transparent;
  color: inherit;
  cursor: pointer;
  min-height: auto;
  padding: 0;
  font-family: var(--table_head--font);
  font-weight: var(--table_head--font-weight);
  text-transform: inherit;
  ${({ nowrap }) => nowrap && `white-space: nowrap;`}

  &:disabled {
    cursor: initial;
  }

  &:hover:not(:disabled) {
    background-color: transparent;
    color: var(--button_text--color);
  }

  @media (min-width: ${breakpoints.xl}rem) {
    font-size: var(--font-size-2);
  }
`
