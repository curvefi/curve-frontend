import type { ThemeKey } from '../basic-theme'

type HexColor = `#${string}${string}${string}${string}${string}${string}`

export const PALETTE = {
  neutral: {
    '25': { light: '#fafafa', dark: '#191815', chad: '#fafafa' },
    '50': { light: '#f8f7f7', dark: '#1f1e1b', chad: '#f8f7f7' },
    '75': { light: '#f6f4f4', dark: '#252420', chad: '#f6f4f4' },
    '100': { light: '#eeeceb', dark: '#302e2a', chad: '#eeeceb' },
    '150': { light: '#e7e4e2', dark: '#3b3834', chad: '#e7e4e2' },
    '200': { light: '#dedbd8', dark: '#494540', chad: '#dedbd8' },
    '300': { light: '#d4d0cc', dark: '#5a554f', chad: '#d4d0cc' },
    '400': { light: '#bbb6af', dark: '#746e66', chad: '#bbb6af' },
    '500': { light: '#968e84', dark: '#968e84', chad: '#968e84' },
    '600': { light: '#746e66', dark: '#bbb6af', chad: '#746e66' },
    '700': { light: '#5a554f', dark: '#d4d0cc', chad: '#5a554f' },
    '750': { light: '#494540', dark: '#dedbd8', chad: '#494540' },
    '800': { light: '#3b3834', dark: '#e7e4e2', chad: '#3b3834' },
    '850': { light: '#302e2a', dark: '#eeeceb', chad: '#302e2a' },
    '900': { light: '#252420', dark: '#f6f4f4', chad: '#252420' },
    '950': { light: '#1f1e1b', dark: '#f8f7f7', chad: '#1f1e1b' },
    '975': { light: '#191815', dark: '#fafafa', chad: '#191815' },
    main: { light: '#968e84', dark: '#968e84', chad: '#968e84' },
    light: { light: '#d4d0cc', dark: '#5a554f', chad: '#d4d0cc' },
    dark: { light: '#5a554f', dark: '#d4d0cc', chad: '#5a554f' },
  },
  primary: {
    '50': { light: '#fefaef', dark: '#171e55', chad: '#efedfc' },
    '100': { light: '#d5dbf0', dark: '#1d2c75', chad: '#dbd9f7' },
    '200': { light: '#acbef1', dark: '#223995', chad: '#c6c4f2' },
    '300': { light: '#839ff2', dark: '#2747b5', chad: '#b0aeee' },
    '400': { light: '#5a81f3', dark: '#2c55d5', chad: '#9997e2' },
    '500': { light: '#3162f4', dark: '#3162f4', chad: '#6a68b7' },
    '600': { light: '#2c55d5', dark: '#5a81f3', chad: '#5f5cae' },
    '700': { light: '#2747b5', dark: '#839ff2', chad: '#554fa5' },
    '800': { light: '#223995', dark: '#acbef1', chad: '#4a4395' },
    '900': { light: '#1d2c75', dark: '#d5dbf0', chad: '#3e3684' },
    '950': { light: '#171e55', dark: '#fefaef', chad: '#2f2862' },
    main: { light: '#3162f4', dark: '#3162f4', chad: '#6a68b7' },
    light: { light: '#839ff2', dark: '#2747b5', chad: '#b0aeee' },
    dark: { light: '#2747b5', dark: '#839ff2', chad: '#554fa5' },
    contrastText: { light: '#1f1e1b', dark: '#f8f7f7', chad: '#1f1e1b' },
  },
  secondary: {
    '100': { light: '#d4f7e3', dark: '#0b3d26', chad: '#d4f7e3' },
    '200': { light: '#a8efc6', dark: '#0f5c38', chad: '#a8efc6' },
    '300': { light: '#32ce79', dark: '#167d4a', chad: '#32ce79' },
    '400': { light: '#27b86c', dark: '#1fa25e', chad: '#27b86c' },
    '500': { light: '#1fa25e', dark: '#27b86c', chad: '#1fa25e' },
    '600': { light: '#167d4a', dark: '#32ce79', chad: '#167d4a' },
    '700': { light: '#0f5c38', dark: '#a8efc6', chad: '#0f5c38' },
    '800': { light: '#0b3d26', dark: '#d4f7e3', chad: '#0b3d26' },
    main: { light: '#1fa25e', dark: '#27b86c', chad: '#1fa25e' },
    light: { light: '#32ce79', dark: '#167d4a', chad: '#32ce79' },
    dark: { light: '#0f5c38', dark: '#a8efc6', chad: '#0f5c38' },
    contrastText: { light: '#5a554f', dark: '#d4d0cc', chad: '#5a554f' },
  },
  tertiary: {
    '200': { light: '#ffd88b', dark: '#ed242f', chad: '#ffd88b' },
    '300': { light: '#ffc300', dark: '#f77f00', chad: '#ffc300' },
    '400': { light: '#f77f00', dark: '#ffc300', chad: '#f77f00' },
    '600': { light: '#ed242f', dark: '#ffd88b', chad: '#ed242f' },
    main: { light: '#f77f00', dark: '#ffc300', chad: '#f77f00' },
    contrastText: { light: '#968e84', dark: '#bbb6af', chad: '#968e84' },
  },
  error: {
    main: { light: '#ed242f', dark: '#ed242f', chad: '#ed242f' },
    contrastText: { light: '#f8f7f7', dark: '#f8f7f7', chad: '#f8f7f7' },
  },
  warning: {
    main: { light: '#ffc300', dark: '#ffc300', chad: '#ffc300' },
    contrastText: { light: '#f77f00', dark: '#ffc300', chad: '#f77f00' },
  },
  info: {
    main: { light: '#839ff2', dark: '#2747b5', chad: '#b0aeee' },
    contrastText: { light: '#1f1e1b', dark: '#f8f7f7', chad: '#1f1e1b' },
  },
  success: {
    main: { light: '#27b86c', dark: '#167d4a', chad: '#27b86c' },
    contrastText: { light: '#252420', dark: '#252420', chad: '#252420' },
  },
  text: {
    primary: { light: '#1f1e1b', dark: '#f8f7f7', chad: '#1f1e1b' },
    secondary: { light: '#5a554f', dark: '#d4d0cc', chad: '#5a554f' },
    tertiary: { light: '#968e84', dark: '#bbb6af', chad: '#968e84' },
    disabled: { light: '#bbb6af', dark: '#968e84', chad: '#bbb6af' },
    highlight: { light: '#3162f4', dark: '#3162f4', chad: '#5f5cae' },
  },
  background: {
    default: { light: '#f8f7f7', dark: '#1f1e1b', chad: '#dbd9f7' },
    paper: { light: '#eeeceb', dark: '#252420', chad: '#c6c4f2' },
    layer1Fill: { light: '#f8f7f7', dark: '#1f1e1b', chad: '#dbd9f7' },
    layer1Outline: { light: '#d4d0cc', dark: '#252420', chad: '#b0aeee' },
    layer2Fill: { light: '#eeeceb', dark: '#252420', chad: '#c6c4f2' },
    layer2Outline: { light: '#dedbd8', dark: '#3b3834', chad: '#9997e2' },
    layer3Fill: { light: '#f8f7f7', dark: '#3b3834', chad: '#b0aeee' },
    layer3Outline: { light: '#d4d0cc', dark: '#5a554f', chad: '#6a68b7' },
    highlightOutline: { light: '#3162f4', dark: '#3162f4', chad: '#4a4395' },
    highlightFill: { light: '#3162f4', dark: '#3162f4', chad: '#4a4395' },
  },
  grey: {
    '10': '#fdfcfc',
    '25': '#fafafa',
    '50': '#f8f7f7',
    '75': '#f6f4f4',
    '100': '#eeeceb',
    '150': '#e7e4e2',
    '200': '#dedbd8',
    '300': '#d4d0cc',
    '400': '#bbb6af',
    '500': '#968e84',
    '600': '#746e66',
    '700': '#5a554f',
    '750': '#494540',
    '800': '#3b3834',
    '850': '#302e2a',
    '900': '#252420',
    '950': '#1f1e1b',
    '975': '#191815',
  },
} as const

const modes = { chad: 'light', light: 'light', dark: 'dark' } as const

export const createPalette = (mode: ThemeKey) =>
  ({
    mode: modes[mode],
    ...Object.fromEntries(
      Object.entries(PALETTE).map(([key, colors]) => [
        key,
        Object.fromEntries(Object.entries(colors).map(([color, hues]) => [color, hues[mode] ?? hues])),
      ]),
    ),
  }) as Palette

export type Palette = { mode: 'light' | 'dark' } & {
  [K1 in keyof typeof PALETTE]: {
    [K in keyof (typeof PALETTE)[K1]]: HexColor
  }
}
