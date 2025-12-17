/// <reference path="./mui-input-base.d.ts" />
import type { Components } from '@mui/material/styles'
import type { TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import type { DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ButtonSize, Spacing } = SizesAndSpaces

export const defineMuiInputBase = (
  { Inputs: { Base } }: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiInputBase'] => ({
  styleOverrides: {
    root: {
      backgroundColor: Base.Default.Fill.Default,
      // color the whole input base when accepting autofill suggestions in Chromium browsers
      ':has(input:autofill)': {
        backgroundColor: 'light-dark(rgb(232, 240, 254), rgba(70, 90, 126, 0.4))',
        boxShadow: '0 0 0 100px #266798 inset',
        '& svg': { color: 'rgb(232, 240, 254)' },
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1,
        transition: `border-color ${TransitionFunction}`,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: Base.Default.Border.Active,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: Base.Default.Border.Error,
      },
      '&.MuiInputBase-sizeSmall input': {
        height: ButtonSize.sm,
      },
      '&.MuiInputBase-sizeTiny input': {
        // not responsive with Sizing, but using ButtonSize as in Figma
        height: ButtonSize.xs,
        ...typography.bodySBold,
      },
    },
    input: {
      height: ButtonSize.md,
      boxSizing: 'border-box',
      textOverflow: 'ellipsis',
      padding: 0,
      ...typography.bodyMBold,
      ...handleBreakpoints({ marginInline: Spacing.xs }),
    },
  },
})
