/// <reference types="./mui-card-content.d.ts" />
import type { CardContentProps } from '@mui/material/CardContent'
import type { Components } from '@mui/material/styles'
import { objectKeys } from '@primitives/objects.utils'
import { DesignSystem } from '@ui/features/themes/design'
import { TRANSPARENT } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { handleBreakpoints } from '../../basic-theme'

const { Padding } = SizesAndSpaces

type CardContentSize = NonNullable<CardContentProps['size']>

const createCardContentSizeStyle = (padding: string) => ({ padding, '&:last-child': { paddingBlockEnd: padding } })

export const CARD_CONTENT_SIZE_STYLES = {
  // TODO: Use extraSmall padding once a dedicated design token is available.
  extraSmall: createCardContentSizeStyle(Padding.Card.sm),
  small: createCardContentSizeStyle(Padding.Card.sm),
  medium: createCardContentSizeStyle(Padding.Card.md),
} as const satisfies Record<CardContentSize, ReturnType<typeof createCardContentSizeStyle>>

export const cardContentInlineStyles = {
  ...handleBreakpoints({ padding: 0 }),
  '&:last-child': handleBreakpoints({ paddingBlockEnd: 0 }),
  '&.MuiCardContent-root': { backgroundColor: TRANSPARENT },
}

export const defineMuiCardContent = (design: DesignSystem): Components['MuiCardContent'] => ({
  styleOverrides: { root: { backgroundColor: design.Layer[1].Fill, ...CARD_CONTENT_SIZE_STYLES.medium } },
  variants: objectKeys(CARD_CONTENT_SIZE_STYLES).map(size => ({
    props: { size },
    style: CARD_CONTENT_SIZE_STYLES[size],
  })),
})
