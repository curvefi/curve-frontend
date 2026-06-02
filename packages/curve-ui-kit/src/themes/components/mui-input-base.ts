// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Existing violation before enabling this rule.
/// <reference path="./mui-input-base.d.ts" />
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import type { DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { InputSize, InputSpacing } = SizesAndSpaces

export const defineMuiInputBase = (
  { Inputs, InputSelect }: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiInputBase'] => ({
  styleOverrides: {
    root: {
      height: InputSize.medium,
      backgroundColor: InputSelect.Base.Default.Fill.Default,
      color: Inputs.Text.Value,
      '&': { paddingRight: '0' }, // inputs have an ugly default 14px padding on the right, not nice with end adornments
      // color the whole input base when accepting autofill suggestions in Chromium browsers
      ':has(input:autofill)': {
        backgroundColor: 'light-dark(rgb(232, 240, 254), rgba(70, 90, 126, 0.4))',
        boxShadow: '0 0 0 100px #266798 inset',
        '& svg': { color: 'rgb(232, 240, 254)' },
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1,
        borderColor: InputSelect.Base.Default.Border.Default,
        transition: `border-color ${TransitionFunction}`,
      },
      '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled)': {
        backgroundColor: InputSelect.Base.Default.Fill.Hover,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: InputSelect.Base.Default.Border.Hover,
        },
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: InputSelect.Base.Default.Border.Active,
        borderWidth: 2,
      },
      '&.Mui-error': {
        color: Inputs.Text.Error,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: InputSelect.Base.Default.Border.Error,
          borderWidth: 2,
        },
      },
      '&.Mui-disabled': {
        color: Inputs.Text.Disabled,
      },
      '& .MuiInputAdornment-root': {
        color: Inputs.Text.Unit,
      },
      '&.Mui-error .MuiInputAdornment-root': {
        color: Inputs.Text.Error,
      },
      '&.Mui-disabled .MuiInputAdornment-root': {
        color: Inputs.Text.Disabled,
      },
      '& .MuiInputAdornment-positionEnd': {
        marginInlineStart: InputSpacing.ValueGap,
        paddingInlineEnd: InputSpacing.ContentPaddingRight,
      },
      '&.MuiInputBase-sizeSmall': {
        height: InputSize.small,
      },
      '&.MuiInputBase-sizeSmall .MuiInputBase-input': {
        height: InputSize.small,
        paddingInlineStart: InputSpacing.PaddingX.small,
        paddingInlineEnd: InputSpacing.ContentPaddingRight,
      },
      '&.MuiInputBase-sizeTiny': {
        height: InputSize.tiny,
      },
      '&.MuiInputBase-sizeTiny .MuiInputBase-input': {
        height: InputSize.tiny,
        ...typography.bodySBold,
        paddingInlineStart: InputSpacing.PaddingX.tiny,
        paddingInlineEnd: InputSpacing.ContentPaddingRight,
      },
      '&.MuiInputBase-sizeExtraLarge': {
        height: InputSize.extraLarge,
      },
      '&.MuiInputBase-sizeExtraLarge .MuiInputBase-input': {
        height: InputSize.extraLarge,
        ...typography.headingSBold,
        paddingInlineStart: InputSpacing.PaddingX.extraLarge,
        paddingInlineEnd: InputSpacing.ContentPaddingRight,
      },
      '&.MuiInputBase-multiline': {
        height: 'auto',
        alignItems: 'flex-start',
      },
      '&.MuiInputBase-multiline .MuiInputBase-input': {
        height: 'auto',
      },
    },
    input: {
      height: InputSize.medium,
      boxSizing: 'border-box',
      textOverflow: 'ellipsis',
      padding: 0,
      ...typography.bodyMBold,
      paddingInlineStart: InputSpacing.PaddingX.medium,
      paddingInlineEnd: InputSpacing.ContentPaddingRight,
      '&::placeholder': {
        color: Inputs.Text.Placeholder,
        opacity: 1,
      },
      '&.Mui-disabled': {
        color: Inputs.Text.Disabled,
        WebkitTextFillColor: Inputs.Text.Disabled,
      },
    },
  },
})
