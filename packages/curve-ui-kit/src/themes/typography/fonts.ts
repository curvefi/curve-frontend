import localFont from 'next/font/local'

export const monaSans = localFont({ src: '../../../public/fonts/Mona-Sans.woff2' })
export const minecraft = localFont({ src: '../../../public/fonts/Minecraft.woff2' })

export const FontFamilyMapping = {
  'Mona Sans': [monaSans.style.fontFamily, '"Helvetica Neue"', 'sans-serif'].join(','),
  'Minecraft': [minecraft.style.fontFamily, '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(','),
} as const
