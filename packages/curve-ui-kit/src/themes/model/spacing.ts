import { type ThemeOptions } from '@mui/material/styles'
import { type ThemeKey } from '../basic-theme'
import { FIGMA_TOKENS } from './figma-tokens.generated'

export const createSpacing = (mode: ThemeKey): ThemeOptions => {
  const { xxs, xs, sm, md, lg, xl, xxl } = FIGMA_TOKENS.mappedSizesAndSpaces.desktop.spacing
  const {
    xxs: mXxs,
    xs: mXs,
    sm: mSm,
    md: mMd,
    lg: mLg,
    xl: mXl,
    xxl: mXxl,
  } = FIGMA_TOKENS.mappedSizesAndSpaces.mobile.spacing
  const theme = FIGMA_TOKENS.themes.desktop[mode]

  return {
    spacing: [0, xxs, xs, sm, md, lg, xl, xxl],

    // TODO: realize mobile spacing
    // [basicMuiTheme.breakpoints.down('tablet')]: {
    //   spacing: [0, mXxs, mXs, mSm, mMd, mLg, mXl, mXxl],
    // },
    shape: {
      borderRadius: theme.radius.square,
    },
  }
}
