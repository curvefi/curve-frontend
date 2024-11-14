import localFont from 'next/font/local'

export const monaSans = localFont({ src: '../../../public/fonts/Mona-Sans.woff2' })
export const hubotSans = localFont({ src: '../../../public/fonts/Hubot-Sans.woff2' })

const FontFamilyMapping = {
  'Mona Sans': [monaSans.style.fontFamily, '"Helvetica Neue"', 'sans-serif'].join(','),
  'Hubot Sans': [
    hubotSans.style.fontFamily,
    '"Helvetica Neue"',
    'sans-serif',
    'Minecraft',
    '"SF Mono Regular 11"',
    '"Ubuntu Mono"',
    'monospace',
  ].join(','),
} as const

export const ThemeFontFamily = {
  light: FontFamilyMapping['Mona Sans'],
  dark: FontFamilyMapping['Mona Sans'],
  chad: FontFamilyMapping['Hubot Sans'],
} as const

/**
 * The fonts imported via the next/font plugin get a different family name.
 * This function replaces the font family name with the generated one.
 */
export const replaceFontName = <T extends { fontFamily: keyof typeof FontFamilyMapping}>({ fontFamily, ...styles }:T) =>
  ({ ...styles, fontFamily: FontFamilyMapping[fontFamily] })
