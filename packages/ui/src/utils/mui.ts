import type { SxProps as MuiSx, Theme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { BorderWidth } = SizesAndSpaces

export type SxProps = MuiSx<Theme>
type SxStyleObject = Exclude<SxProps, ((theme: Theme) => unknown) | readonly unknown[]>

/**
 * Utility function to resolve sx props by calling theme function if needed and provided
 * @param sx - The sx prop value (style object, theme function, or undefined)
 */
export const applySxProps = (...sx: (SxProps | false | null | undefined)[]): SxProps =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Existing violation before enabling this rule.
  sx.flatMap(s => (Array.isArray(s) ? s : notFalsy(s)))

/**
 * Selects every direct child that has a previous sibling. This is useful for applying styles between children, such as
 * borders, spacing, or dividers, without affecting the first child.
 */
export const directChildrenAfterFirst = (css: SxStyleObject): SxProps => ({
  '& > * + *': css,
})

/**
 * Makes stacked cards feel like sections of one card: the first keeps its normal header, while each subsequent
 * card gets a header background spanning its full width. Cards render conditionally, so assigning header styles
 * by a fixed section order would not reliably identify the first visible card.
 * The selector follows the rendered order instead, styling each card header that immediately follows another card.
 */
export const stackedMarketCardHeadersSx: SxProps = theme => ({
  '& > .MuiCard-root + .MuiCard-root > .MuiCardHeader-root': {
    backgroundColor: theme.design.Layer[1].Fill,
  },
})

/** Consistent border style for MUI components */
export const borderStyle = (t: Theme) => `${BorderWidth.thin} solid ${t.design.Layer[1].Outline}`
