import type { Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'

/** Type definition for MUI sx prop that accepts either a style object or a function returning a style object */
export type SxProps = SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>)

/**
 * Utility function to resolve sx props by calling theme function if needed and provided
 * @param sx - The sx prop value (style object, theme function, or undefined)
 * @param theme - The MUI theme object
 */
export const applySxProps = (sx: SxProps | undefined, theme: Theme) => (typeof sx === 'function' ? sx(theme) : sx)
