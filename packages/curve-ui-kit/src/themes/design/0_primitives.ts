export const Grays = {
  '10': '#fdfcfcff',
  '25': '#fafafaff',
  '50': '#f8f7f7ff',
  '75': '#f6f4f4ff',
  '100': '#eeecebff',
  '150': '#e7e4e2ff',
  '200': '#dedbd8ff',
  '300': '#d4d0ccff',
  '400': '#bbb6afff',
  '500': '#968e84ff',
  '600': '#746e66ff',
  '700': '#5a554fff',
  '750': '#494540ff',
  '800': '#3b3834ff',
  '850': '#302e2aff',
  '900': '#252420ff',
  '950': '#1f1e1bff',
  '975': '#191815ff',
} as const

export const Greens = {
  '100': '#d4f7e3ff',
  '200': '#a8efc6ff',
  '300': '#32ce79ff',
  '400': '#27b86cff',
  '500': '#1fa25eff',
  '600': '#167d4aff',
  '700': '#0f5c38ff',
  '800': '#0b3d26ff',
} as const

export const Reds = {
  '200': '#ffd88bff',
  '300': '#ffc300ff',
  '400': '#f77f00ff',
  '500': '#ed242fff',
  '600': '#d41e26ff',
  '700': '#b0151fff',
  '800': '#8c111cff',
} as const

export const Blues = {
  '50': '#fefaefff',
  '100': '#d5dbf0ff',
  '200': '#acbef1ff',
  '300': '#839ff2ff',
  '400': '#5a81f3ff',
  '500': '#3162f4ff',
  '600': '#2c55d5ff',
  '700': '#2747b5ff',
  '800': '#223995ff',
  '900': '#1d2c75ff',
  '950': '#171e55ff',
} as const

export const Oranges = {
  '50': '#f0ddd1ff',
  '100': '#f3cfb9ff',
  '200': '#f5bd98ff',
  '300': '#f4ab7aff',
  '400': '#f49753ff',
  '500': '#f77f00ff',
  '600': '#d36c00ff',
  '700': '#b15900ff',
  '800': '#8f4700ff',
  '900': '#6f3601ff',
  '950': '#4e2708ff',
} as const

export const Yellows = {
  '50': '#fffbf5ff',
  '100': '#fff9f0ff',
  '200': '#fff1dbff',
  '300': '#ffe6bdff',
  '400': '#ffd88bff',
  '500': '#ffc300ff',
  '600': '#e0ab00ff',
  '700': '#c19300ff',
  '800': '#a37c0cff',
  '900': '#84671dff',
  '950': '#665223ff',
} as const

export const Violets = {
  '50': '#efedfcff',
  '100': '#dbd9f7ff',
  '200': '#c6c4f2ff',
  '300': '#b0aeeeff',
  '400': '#9997e2ff',
  '500': '#6a68b7ff',
  '600': '#5f5caeff',
  '700': '#554fa5ff',
  '800': '#4a4395ff',
  '900': '#3e3684ff',
  '950': '#2f2862ff',
} as const

export const Spacing = {
  '50': undefined,
  '75': '0.0625rem' /* 1px */,
  '100': '0.125rem' /* 2px */,
  '200': '0.25rem' /* 4px */,
  '300': '0.5rem' /* 8px */,
  '350': '0.875rem' /* 14px */,
  '400': '1rem' /* 16px */,
  '450': '1.25rem' /* 20px */,
  '500': '1.5rem' /* 24px */,
  '600': '2rem' /* 32px */,
  '700': '3rem' /* 48px */,
  '800': '4rem' /* 64px */,
} as const

export const Sizing = {
  '10': '0.0625rem' /* 1px */,
  '25': '0.125rem' /* 2px */,
  '50': '0.25rem' /* 4px */,
  '100': '0.5rem' /* 8px */,
  '125': '0.75rem' /* 12px */,
  '150': '0.875rem' /* 14px */,
  '200': '1rem' /* 16px */,
  '250': '1.25rem' /* 20px */,
  '300': '1.5rem' /* 24px */,
  '350': '1.75rem' /* 28px */,
  '400': '2rem' /* 32px */,
  '450': '2.25rem',
  '500': '2.5rem' /* 40px */,
  '600': '3rem' /* 48px */,
  '650': '3.5rem' /* 56px */,
  '700': '4rem' /* 64px */,
  '800': '5.5rem' /* 88px */,
} as const

export const Duration = {
  Snackbar: 6000,
  Tooltip: { Enter: 500, Exit: 500 },
  Flicker: 1000,
  FormDebounce: 500,
  Transition: 256,
  Focus: 50,
  Delay: 100,
}
export const TransitionFunction = `ease-out ${Duration.Transition}ms`
