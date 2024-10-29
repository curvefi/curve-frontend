import { type ThemeOptions } from '@mui/material/styles'

import { figmaTokens, extractNumber } from '../../../shared/api/figma-tokens'
import { type ThemeKey } from '../../../shared/lib/basic-theme'

export const createSpacing = (mode: ThemeKey): ThemeOptions => {
  const { xxs, xs, sm, md, lg, xl, xxl } = figmaTokens.mappedSizesAndSpaces.desktop.spacing
  const {
    xxs: mXxs,
    xs: mXs,
    sm: mSm,
    md: mMd,
    lg: mLg,
    xl: mXl,
    xxl: mXxl,
  } = figmaTokens.mappedSizesAndSpaces.mobile.spacing
  const theme = figmaTokens.themes.desktop[mode]

  return {
    spacing: [0, xxs, xs, sm, md, lg, xl, xxl],

    // TODO: realize mobile spacing
    // [basicMuiTheme.breakpoints.down('tablet')]: {
    //   spacing: [0, mXxs, mXs, mSm, mMd, mLg, mXl, mXxl],
    // },
    shape: {
      borderRadius: extractNumber(theme.radius.md),
    },
  }
}
