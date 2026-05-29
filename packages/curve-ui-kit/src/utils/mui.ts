import type { SxProps as MuiSx, Theme } from '@mui/material/styles'

export type SxProps = MuiSx<Theme>

/**
 * Utility function to resolve sx props by calling theme function if needed and provided
 * @param sx - The sx prop value (style object, theme function, or undefined)
 */
export const applySxProps = (...sx: (SxProps | false | null | undefined)[]): SxProps =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Existing violation before enabling this rule.
  sx.flatMap(s => (Array.isArray(s) ? s : s ? [s] : []))
