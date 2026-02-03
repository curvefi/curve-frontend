import type { ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { TextCaption } from '@ui/TextCaption'

type DivProps = ComponentPropsWithRef<'div'>
type FieldsWrapperProps = { $showBorder?: boolean }
type FieldsTitleProps = { $noMargin?: boolean }
type TextCaptionStyleProps = { isBold?: boolean; isBlock?: boolean; isCaps?: boolean }
type H3Props = ComponentPropsWithRef<'h3'>

export const FieldsWrapper: IStyledComponent<'web', FieldsWrapperProps & DivProps> = styled.div<FieldsWrapperProps>`
  display: grid;
  grid-gap: var(--spacing-3);

  ${({ $showBorder }) => {
    if ($showBorder) {
      return `
        border: 1px solid var(--border-400);
        padding: var(--spacing-narrow);
        margin-bottom: var(--spacing-2);
      `
    }
  }}
`

export const FieldsTitle: IStyledComponent<'web', FieldsTitleProps & TextCaptionStyleProps & H3Props> = styled(
  TextCaption,
).attrs(() => ({ as: 'h3', isBold: true, isCaps: true }))<FieldsTitleProps>`
  padding-top: var(--spacing-2);
`
