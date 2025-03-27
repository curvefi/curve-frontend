import type { Components } from '@mui/material'
import type { TypographyOptions } from '@mui/material/styles/createTypography'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@ui-kit/shared/icons/InfoCircledIcon'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DesignSystem } from './design'

const { Spacing, IconSize } = SizesAndSpaces

const titleAndIconSelector = '.MuiAlertTitle-root, .MuiAlert-icon'

export const defineMuiAlert = (
  { Layer: { 1: Layer1, Feedback, Highlight }, Text: { TextColors } }: DesignSystem,
  { bodyXsRegular }: TypographyOptions,
): Components['MuiAlert'] => ({
  defaultProps: {
    iconMapping: {
      success: <CheckIcon fontSize={'small'} />,
      info: <InfoCircledIcon fontSize={'small'} />,
      warning: <ExclamationTriangleIcon fontSize={'small'} />,
      error: <ExclamationTriangleIcon fontSize={'small'} />,
    },
  },
  styleOverrides: {
    root: handleBreakpoints({
      ...bodyXsRegular,
      paddingInlineStart: Spacing.md,
      paddingInlineEnd: Spacing.sm,
      paddingBlockStart: Spacing.sm,
      paddingBlockEnd: Spacing.xs,
    }),
    outlined: {
      backgroundColor: Layer1.Fill,
      color: TextColors.Secondary,
      '&.MuiAlert-colorInfo': {
        [titleAndIconSelector]: { color: TextColors.Highlight },
        borderColor: Highlight.Outline,
      },
      '&.MuiAlert-colorSuccess': {
        [titleAndIconSelector]: { color: TextColors.Feedback.Success },
        borderColor: Feedback.Success,
      },
      '&.MuiAlert-colorWarning': {
        [titleAndIconSelector]: { color: TextColors.Feedback.Warning },
        borderColor: Feedback.Warning,
      },
      '&.MuiAlert-colorError': {
        [titleAndIconSelector]: { color: TextColors.Feedback.Error },
        borderColor: Feedback.Error,
      },
    },
    filled: {
      color: TextColors.Feedback.Inverted,
      '&.MuiAlert-colorInfo': { backgroundColor: Feedback.Info },
      '&.MuiAlert-colorSuccess': { backgroundColor: Feedback.Success },
      '&.MuiAlert-colorWarning': { backgroundColor: Feedback.Warning, color: TextColors.Primary },
      '&.MuiAlert-colorError': { backgroundColor: Feedback.Error },
    },
    icon: {
      ...handleBreakpoints({ marginRight: Spacing.xs }),
      '& svg': handleBreakpoints({
        width: IconSize.sm,
        height: IconSize.sm,
      }),
    },
  },
})

export const defineMuiAlertTitle = (
  {}: DesignSystem,
  { bodySBold }: TypographyOptions,
): Components['MuiAlertTitle'] => ({
  styleOverrides: {
    root: handleBreakpoints({
      ...bodySBold,
      height: IconSize.sm,
      marginBlockEnd: '4px',
    }),
  },
})
