import { styled } from 'styled-components'
import { TextCaption } from '@ui/TextCaption'

export const FieldsWrapper = styled.div<{ $showBorder?: boolean }>`
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

export const FieldsTitle = styled(TextCaption).attrs(() => ({ as: 'h3', isBold: true, isCaps: true }))<{
  $noMargin?: boolean
}>`
  padding-top: var(--spacing-2);
`
