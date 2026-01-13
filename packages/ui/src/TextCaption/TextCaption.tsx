import { styled } from 'styled-components'

export const TextCaption = styled.span<{ isBold?: boolean; isBlock?: boolean; isCaps?: boolean }>`
  font-size: var(--font-size-1);
  text-transform: ${({ isCaps }) => (isCaps ? 'uppercase' : 'initial')};

  ${({ isBold }) => {
    if (isBold) {
      return `font-weight: bold;`
    }
  }};

  ${({ isBlock }) => {
    if (isBlock) {
      return `
        display: block;
        margin-bottom: 2px;
      `
    }
  }};
`
