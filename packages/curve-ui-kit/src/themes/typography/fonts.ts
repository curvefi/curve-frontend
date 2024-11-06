import localFont from 'next/font/local'

export const monaSans = localFont({
  src: '../../../public/fonts/Mona-Sans.woff2',
  // variable: '--font-mona-sans'
})

export const hubotSans = localFont({
  src: '../../../public/fonts/Hubot-Sans.woff2',
  variable: '--font-hubot-sans'
})

const MonaSansFontFamily = [monaSans.style.fontFamily, '"Helvetica Neue"', 'sans-serif'].join(',')
const HubotSansFontFamily = [
  hubotSans.style.fontFamily,
  '"Helvetica Neue"',
  'sans-serif',
  'Minecraft',
  '"SF Mono Regular 11"',
  '"Ubuntu Mono"',
  'monospace',
].join(',')


export const ThemeFontFamily = {light: MonaSansFontFamily, dark: MonaSansFontFamily, chad: HubotSansFontFamily} as const
const FontFamilyMapping = { 'Mona Sans': MonaSansFontFamily, 'Hubot Sans': HubotSansFontFamily}

export const replaceFontName = <T extends { fontFamily: keyof typeof FontFamilyMapping}>({ fontFamily, ...styles }:T) =>
  ({ ...styles, fontFamily: FontFamilyMapping[fontFamily] })

