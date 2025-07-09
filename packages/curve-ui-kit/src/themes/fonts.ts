import { CSSProperties } from 'react'

// Fonts might not load when running Storybook locally.
export const monaSans = { style: { fontFamily: 'MonaSans' } }
export const hubotSans = { style: { fontFamily: 'Hubot Sans' } }
export const minecraft = { style: { fontFamily: 'Minecraft' } }

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
