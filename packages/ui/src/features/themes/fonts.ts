/**
 * Utility function to create a font stack. Named families need quotes, CSS generic families must stay unquoted.
 */
const CSS_GENERIC_FAMILIES = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'])
const fontStack = (...fonts: string[]) => fonts.map(f => (CSS_GENERIC_FAMILIES.has(f) ? f : `"${f}"`)).join(', ')

export const Fonts = {
  'Mona Sans': fontStack('Mona Sans', 'Helvetica Neue', 'Helvetica', 'sans-serif'),
  'Ioskeley Mono': fontStack('Ioskeley Mono', 'SF Mono Regular 11', 'Ubuntu Mono', 'monospace'),
}
