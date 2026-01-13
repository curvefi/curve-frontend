import { styled } from 'styled-components'
import { breakpoints } from 'ui/src/utils/responsive'
import type { BoxProps } from './types'

function attributes({ className, fillHeight, fillWidth, ...rest }: BoxProps) {
  const fillWidthClassName = fillWidth ? 'width--full' : ''
  const fillHeightClassName = fillHeight ? 'height--full' : ''
  const classNames = `${className || ''} ${fillWidthClassName} ${fillHeightClassName}`
  return { ...rest, className: classNames }
}

export const Box = styled.div.attrs(attributes)<BoxProps>`
  /* Flexbox styles */
  ${({ flex }) => flex && 'display: flex;'}
  ${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
  ${({ flexColumn }) => flexColumn && `flex-direction: column;`}
  ${({ flexAlignItems }) => flexAlignItems && `align-items: ${flexAlignItems};`}
  ${({ flexJustifyContent }) => flexJustifyContent && `justify-content: ${flexJustifyContent};`}
  ${({ flexWrap }) => flexWrap && `flex-wrap: ${flexWrap};`}
  ${({ flexGap }) => flexGap && `gap: ${flexGap};`}

  ${({ flexCenter }) => {
    if (flexCenter) {
      return `
        align-items: center;
        justify-content: center;
      `
    }
  }};

  /* Grid styles */
  ${({ grid }) => grid && 'display: grid;'}
  ${({ gridArea }) => gridArea && `grid-area: grid-${gridArea};`}
  ${({ gridAutoColumns }) => gridAutoColumns && `grid-auto-columns: ${gridAutoColumns};`}
  ${({ gridAutoRows }) => gridAutoRows && `grid-auto-rows: ${gridAutoRows};`}
  ${({ gridAutoFlow }) => gridAutoFlow && `grid-auto-flow: ${gridAutoFlow};`}
  ${({ gridGap }) => gridGap && `grid-gap: var(--spacing-${gridGap});`}
  ${({ gridColumnGap }) => gridColumnGap && `grid-column-gap: var(--spacing-${gridColumnGap});`}
  ${({ gridRowGap }) => gridRowGap && `grid-row-gap: var(--spacing-${gridRowGap});`};
  ${({ gridTemplateColumns }) => gridTemplateColumns && `grid-template-columns: ${gridTemplateColumns};`};
  ${({ gridTemplateRows }) => gridTemplateRows && `grid-template-rows: ${gridTemplateRows};`};

  ${({ display }) => display && `display: ${display};`}

  /* Box - spacing */
  ${({ padding }) => {
    if (padding === true) {
      return `
        padding: var(--spacing-narrow);

        @media (min-width: ${breakpoints.md}rem) {
          padding: var(--spacing-3);
        }
      `
    } else if (typeof padding === 'string') {
      return `padding: ${padding};`
    }
  }}

  ${({ margin }) => {
    if (margin) {
      return `margin: ${margin};`
    }
  }}

  /* Box - order */
  ${({ variant }) => {
    if (variant === 'primary') {
      return `
        color: var(--box--primary--color);
        background: var(--box--primary--background);
      `
    } else if (variant === 'secondary') {
      return `
        color: inherit;
        border: var(--box--secondary--border);
        background-color: var(--box--secondary--background-color);
      `
    }
  }}

  /* Box - modifiers */
  ${({ shadowed }) => {
    if (shadowed) {
      return `box-shadow: 6px 6px 0 var(--box--primary--shadow-color);`
    }
  }}

  ${({ maxWidth }) => {
    if (maxWidth) {
      return `max-width: ${maxWidth};`
    }
  }}
`
