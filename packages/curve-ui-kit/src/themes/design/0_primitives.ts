import { keyframes } from '@mui/material/styles'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

export const Grays = {
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
} as const

export const Greens = {
  '100': '#d4f7e3',
  '200': '#a8efc6',
  '300': '#32ce79',
  '400': '#27b86c',
  '500': '#1fa25e',
  '600': '#167d4a',
  '700': '#0f5c38',
  '800': '#0b3d26',
} as const

export const Reds = {
  '200': '#ffd88b',
  '300': '#ffc300',
  '400': '#f77f00',
  '500': '#ed242f',
  '600': '#d41e26',
  '700': '#b0151f',
  '800': '#8c111c',
} as const

export const Blues = {
  '50': '#fefaef',
  '100': '#d5dbf0',
  '200': '#acbef1',
  '300': '#839ff2',
  '400': '#5a81f3',
  '500': '#3162f4',
  '600': '#2c55d5',
  '700': '#2747b5',
  '800': '#223995',
  '900': '#1d2c75',
  '950': '#171e55',
} as const

export const Oranges = {
  '50': '#f0ddd1',
  '100': '#f3cfb9',
  '200': '#f5bd98',
  '300': '#f4ab7a',
  '400': '#f49753',
  '500': '#f77f00',
  '600': '#d36c00',
  '700': '#b15900',
  '800': '#8f4700',
  '900': '#6f3601',
  '950': '#4e2708',
} as const

export const Yellows = {
  '50': '#fffbf5',
  '100': '#fff9f0',
  '200': '#fff1db',
  '300': '#ffe6bd',
  '400': '#ffd88b',
  '500': '#ffc300',
  '600': '#e0ab00',
  '700': '#c19300',
  '800': '#a37c0c',
  '900': '#84671d',
  '950': '#665223',
} as const

export const Violets = {
  '50': '#efedfc',
  '100': '#dbd9f7',
  '200': '#c6c4f2',
  '300': '#b0aeee',
  '400': '#9997e2',
  '500': '#6a68b7',
  '600': '#5f5cae',
  '700': '#554fa5',
  '800': '#4a4395',
  '900': '#3e3684',
  '950': '#2f2862',
} as const

export const Transparent = '#ffffff00' as const

export const Spacing = {
  '0': '0rem',
  '75': '0.062rem', // ~1px
  '100': '0.125rem', // 2px
  '200': '0.25rem', // 4px
  '300': '0.5rem', // 8px
  '350': '0.875rem', // 14px
  '400': '1rem', // 16px
  '450': '1.25rem', // 20px
  '500': '1.5rem', // 24px
  '600': '2rem', // 32px
  '700': '3rem', // 48px
  '800': '4rem', // 64px
} as const

export const Sizing = {
  '10': '0.062rem', // ~1px
  '25': '0.125rem', // 2px
  '50': '0.25rem', // 4px
  '100': '0.5rem', // 8px
  '125': '0.75rem', // 12px
  '150': '0.875rem', // 14px
  '200': '1rem', // 16px
  '250': '1.25rem', // 20px
  '300': '1.5rem', // 24px
  '350': '1.75rem', // 28px
  '400': '2rem', // 32px
  '450': '2.25rem', // 36px
  '500': '2.5rem', // 40px
  '600': '3rem', // 48px
  '650': '3.5rem', // 56px
  '700': '4rem', // 64px
  '800': '5.5rem', // 88px
} as const

export const Duration = {
  Delay: 100,
  Flicker: 1000,
  Focus: 50,
  FormDebounce: 350,
  TransactionPollTimeout: 2 * 60 * 1000, // 2 minutes
  Toast: { success: 5000, info: 5000, warning: 10000, error: 10000 },
  Tooltip: { Enter: 500, Exit: 500 },
  Transition: 256,
  LoadingAnimation: 1000,
  Banner: {
    Daily: TIME_FRAMES.DAY_MS,
    Monthly: TIME_FRAMES.MONTH_MS,
  },
}

export const Transition = `ease-out`
export const TransitionFunction = `${Transition} ${Duration.Transition}ms`

export const LoadingAnimation = {
  animation: `${keyframes` 100% { transform: rotate(360deg); }`} ${Transition} ${Duration.LoadingAnimation}ms infinite`,
  transformOrigin: 'center',
}
