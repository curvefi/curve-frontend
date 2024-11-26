import localFont from 'next/font/local'

export const monaSans = localFont({ src: '../../../public/fonts/Mona-Sans.woff2' })
export const hubotSans = localFont({ src: '../../../public/fonts/Hubot-Sans.woff2' })
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

const MonaSans = [monaSans.style.fontFamily, '"Helvetica Neue"', 'Helvetica', 'sans-serif'].join(',')
const HubotSans = [hubotSans.style.fontFamily, '"Helvetica Neue"', 'Helvetica', 'sans-serif'].join(',')
const Minecraft = [minecraft.style.fontFamily, '"SF Mono Regular 11"', '"Ubuntu Mono"', 'monospace'].join(',')

export const ThemeFontFamily = {
  chad: { body: HubotSans, header: Minecraft, button: Minecraft },
  light: { body: MonaSans, header: MonaSans, button: MonaSans },
  dark: { body: MonaSans, header: MonaSans, button: MonaSans },
}

export const RootCssProperties = {
  '--font-monaSans': MonaSans,
  '--font-hubotSans': HubotSans,
  '--font-minecraft': Minecraft,
  '--font': MonaSans,
  '--font-mono': Minecraft,
}
