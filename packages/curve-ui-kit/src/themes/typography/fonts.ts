import localFont from 'next/font/local'
import { CSSProperties } from 'react'

const isStorybook = process.env.STORYBOOK === 'true'

const monaSansFont = localFont({ src: '../../../public/fonts/Mona-Sans.woff2' })
const hubotSansFont = localFont({ src: '../../../public/fonts/Hubot-Sans.woff2' })
const minecraftFont = localFont({
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

export const monaSans = isStorybook ? { style: { fontFamily: 'MonaSans' } } : monaSansFont
export const hubotSans = isStorybook ? { style: { fontFamily: 'Hubot Sans' } } : hubotSansFont
export const minecraft = isStorybook ? { style: { fontFamily: 'Minecraft' } } : minecraftFont

const MonaSans = [monaSans.style.fontFamily, '"Helvetica Neue"', 'Helvetica', 'sans-serif'].join(',')
const HubotSans = [hubotSans.style.fontFamily, '"Helvetica Neue"', 'Helvetica', 'sans-serif'].join(',')
const Minecraft = [minecraft.style.fontFamily, '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(',')

export const Fonts = {
  'Mona Sans': MonaSans,
  'Hubot Sans': HubotSans,
  Minecraft,
}

export const RootCssProperties = { '--font': MonaSans, '--font-mono': Minecraft } as CSSProperties
export const ChadCssProperties = { '--font': HubotSans, '--button--font': Minecraft } as CSSProperties
