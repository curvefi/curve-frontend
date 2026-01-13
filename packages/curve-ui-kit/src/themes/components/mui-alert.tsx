import type { Components } from '@mui/material'
import type { TypographyVariantsOptions } from '@mui/material/styles'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@ui-kit/shared/icons/InfoCircledIcon'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DesignSystem } from '../design'

const { Spacing, IconSize, OutlineWidth } = SizesAndSpaces

const titleAndIconSelector = '.MuiAlertTitle-root, .MuiAlert-icon'

export const defineMuiAlert = (
  { Layer: { 1: Layer1, Feedback, Highlight }, Text: { TextColors } }: DesignSystem,
  { bodyXsRegular }: TypographyVariantsOptions,
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
    root: {
      ...handleBreakpoints({
        ...bodyXsRegular,
        borderWidth: OutlineWidth,
        paddingInline: Spacing.xs,
        paddingBlockStart: 0,
        paddingBlockEnd: Spacing.xs,
      }),
      '& .MuiAlert-message': {
        ...handleBreakpoints({
          paddingInlineEnd: Spacing.sm,
          paddingBlockStart: Spacing.sm,
          paddingBlockEnd: Spacing.xs,
        }),
      },
    },
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
      '&.MuiAlert-colorError': { backgroundColor: Feedback.Error, color: TextColors.FilledFeedback.Alert.Primary },
    },
    icon: {
      ...handleBreakpoints({
        paddingInlineStart: Spacing.sm,
        paddingBlockStart: Spacing.sm,
        paddingBlockEnd: Spacing.xs,
        marginRight: Spacing.xs,
      }),
      '& svg': handleBreakpoints({
        width: IconSize.sm,
        height: IconSize.sm,
      }),
    },
  },
})

export const defineMuiAlertTitle = ({ bodySBold }: TypographyVariantsOptions): Components['MuiAlertTitle'] => ({
  styleOverrides: {
    root: handleBreakpoints({
      ...bodySBold,
      minHeight: IconSize.sm,
      marginBlockEnd: '4px',
      marginBlockStart: 0, // For some reason margin-top is -2px in MUI by default
    }),
  },
})
