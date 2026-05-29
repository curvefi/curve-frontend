import type { SxProps as MuiSx, Theme } from '@mui/material/styles'

export type SxProps = MuiSx<Theme>
type SxStyleObject = Exclude<SxProps, ((theme: Theme) => unknown) | readonly unknown[]>

/**
 * Utility function to resolve sx props by calling theme function if needed and provided
 * @param sx - The sx prop value (style object, theme function, or undefined)
 */
export const applySxProps = (...sx: (SxProps | false | null | undefined)[]): SxProps =>
  sx.flatMap(s => (Array.isArray(s) ? s : s ? [s] : []))

/**
 * Selects every direct child that has a previous sibling. This is useful for applying styles between children, such as
 * borders, spacing, or dividers, without affecting the first child.
 */
export const directChildrenAfterFirst = (css: SxStyleObject): SxProps => ({
  '& > * + *': css,
})
/** Consistent border style for MUI components */
export const borderStyle = (t: Theme) => `1px solid ${t.design.Layer[1].Outline}`
