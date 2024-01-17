import styled from 'styled-components'

const TextCaption = styled.span<{ isBold?: boolean; isBlock?: boolean; isCaps?: boolean }>`
  font-size: var(--font-size-1);

  ${({ isBold }) => {
    if (isBold) {
      return `font-weight: bold;`
    }
  }}

  ${({ isBlock }) => {
    if (isBlock) {
      return `
        display: block;
        margin-bottom: 2px;
      `
    }
  }}

  ${({ isCaps }) => {
    if (isCaps) {
      return `text-transform: uppercase;`
    }
  }}
`
export default TextCaption
