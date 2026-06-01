/**
 * Utility function to create a font stack. The quotes are important to create valid CSS font stacks.
 */
const fontStack = (...fonts: string[]) => fonts.map(f => `"${f}"`).join(', ')

export const Fonts = {
  'Mona Sans': fontStack('Mona Sans', 'Helvetica Neue', 'Helvetica', 'sans-serif'),
  'Hubot Sans': fontStack('Hubot Sans', 'Helvetica Neue', 'Helvetica', 'sans-serif'),
  'Ioskeley Mono': fontStack('Ioskeley Mono', 'SF Mono Regular 11', 'Ubuntu Mono', 'monospace'),
}
