import localFont from 'next/font/local'

export const monaSans = localFont({ src: '../../../public/fonts/Mona-Sans.woff2' })
export const hubotSans = localFont({ src: '../../../public/fonts/Hubot-Sans.woff2' })
export const minecraft = localFont({ src: '../../../public/fonts/Minecraft.woff2' })

export const FontFamilyMapping = {
  'Mona Sans': [monaSans.style.fontFamily, '"Helvetica Neue"', 'sans-serif'].join(','),
  'Hubot Sans': [hubotSans.style.fontFamily, '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(','),
  'Minecraft': [minecraft.style.fontFamily, '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(','),
} as const

type SupportedFontFamily = keyof typeof FontFamilyMapping

/**
 * The fonts imported via the next/font plugin get a different family name.
 * This function replaces the font family name with the generated one.
 */
export const replaceFontName = <T extends { fontFamily: SupportedFontFamily }>({
  fontFamily,
  ...styles
}: T) => ({ ...styles, fontFamily: FontFamilyMapping[fontFamily] })
