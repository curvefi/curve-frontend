import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'

type TextCaptionProps = { isBold?: boolean; isBlock?: boolean; isCaps?: boolean }

export const TextCaption: IStyledComponent<'web', TextCaptionProps & ComponentPropsWithRef<'span'>> =
  styled.span<TextCaptionProps>`
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
