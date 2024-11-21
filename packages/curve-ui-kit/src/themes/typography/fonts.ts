import localFont from 'next/font/local'

export const monaSans = localFont({ src: '../../../public/fonts/Mona-Sans.woff2' })
export const minecraft = localFont({
  src: [
    {
      path: '../../../public/fonts/Minecraft-Regular.otf',
      weight: 'normal',
    },
    {
      path: '../../../public/fonts/Minecraft-Bold.otf',
      weight: 'bold',
    },
  ],
})
export const FontFamilyMapping = {
  'Mona Sans': [monaSans.style.fontFamily, '"Helvetica Neue"', 'sans-serif'].join(','),
  'Minecraft': [minecraft.style.fontFamily, '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(','),
} as const
