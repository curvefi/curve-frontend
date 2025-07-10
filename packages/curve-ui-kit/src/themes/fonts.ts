import { CSSProperties } from 'react'
import '../../public/fonts/Hubot-Sans.woff2'
import '../../public/fonts/Minecraft-Bold.otf'
import '../../public/fonts/Minecraft-Regular.otf'
import '../../public/fonts/Mona-Sans.woff2'

const MonaSans = ['MonaSans', '"Helvetica Neue"', 'Helvetica', 'sans-serif'].join(',')
const HubotSans = ['Hubot Sans', '"Helvetica Neue"', 'Helvetica', 'sans-serif'].join(',')
const Minecraft = ['Minecraft', '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(',')

export const Fonts = {
  'Mona Sans': MonaSans,
  'Hubot Sans': HubotSans,
  Minecraft,
}

export const ChadCssProperties = { '--font': HubotSans, '--button--font': Minecraft } as CSSProperties
