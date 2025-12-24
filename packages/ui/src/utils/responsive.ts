import { Interpolation } from 'styled-components'

export const breakpoints = {
  xxs: 20, // >=320
  xs: 30, // >= 480
  sm: 26.625, // >= 426
  md: 60.063, // >= 961
  lg: 80, // >= 1280
  xl: 120.063, // >= 1921
}

export const mediaQueries =
  (key: keyof typeof breakpoints) => (style: TemplateStringsArray | string | Interpolation<object>) =>
    `@media (min-width: ${breakpoints[key]}rem) { ${style} }`
