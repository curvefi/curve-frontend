import type { FlattenSimpleInterpolation } from 'styled-components'

export const breakpoints = {
  xxs: 20, // >=320
  xs: 30, // >= 480
  sm: 26.625, // >= 426
  md: 60.063, // >= 961
  lg: 80, // >= 1280
  xl: 120.063, // >= 1921
}

export const mediaQueries =
  (key: keyof typeof breakpoints) => (style: TemplateStringsArray | String | FlattenSimpleInterpolation) =>
    `@media (min-width: ${breakpoints[key]}rem) { ${style} }`

export function getPageWidthClassName(innerWidth: number) {
  if (innerWidth > 1920) {
    return 'page-wide'
  } else if (innerWidth > 1280 && innerWidth <= 1920) {
    return 'page-large'
  } else if (innerWidth > 960 && innerWidth <= 1280) {
    return 'page-medium'
  } else if (innerWidth > 450 && innerWidth <= 960) {
    return 'page-small'
  } else if (innerWidth > 321 && innerWidth <= 450) {
    return 'page-small-x'
  } else {
    return 'page-small-xx'
  }
}
