import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { SelectListItem } = SizesAndSpaces

export const defineMuiMenuItem = (design: DesignSystem): Components['MuiMenuItem'] => ({
  styleOverrides: {
    root: {
      ...handleBreakpoints({
        height: SelectListItem.Height.medium,
        transition: design.Button.Transition,
        gap: SelectListItem.Gap,
        paddingBlock: SelectListItem.PaddingY,
        paddingInline: SelectListItem.PaddingX.medium,
      }),
      '&:hover': {
        backgroundColor: design.Layer.TypeAction.Hover,
      },
      // focus visible is used for keyboard navigation. This will usually be inverted theme via <InvertOnHover>
      '&.Mui-focusVisible': {
        backgroundColor: design.Layer.TypeAction.Hover,
        '.MuiTypography-root': { '--mui-palette-text-primary': 'inherit' },
      },
      '&.Mui-selected': {
        backgroundColor: design.Layer.TypeAction.Selected,
        '&:hover': {
          backgroundColor: design.Layer.TypeAction.Selected, // usually inverted via <InvertOnHover>
        },
      },
    },
    dense: {
      ...handleBreakpoints({
        height: SelectListItem.Height.small,
        paddingInline: SelectListItem.PaddingX.small,
      }),
    },
  },
})
