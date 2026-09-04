import type { Components } from '@mui/material'
import type { TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CheckIcon } from '@ui/icons/CheckIcon'
import { ExclamationTriangleIcon } from '@ui/icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '@ui/icons/InfoCircledIcon'
import { DesignSystem } from '../design'

const { Spacing, IconSize, OutlineWidth: OUTLINE_WIDTH } = SizesAndSpaces

const TITLE_AND_ICON_SELECTOR = '.MuiAlertTitle-root, .MuiAlert-icon'
const ICON_SELECTOR = '& .MuiAlert-icon'
const FILLED_ACTION_SELECTOR =
  '& .MuiAlert-action, & .MuiAlert-action .MuiButton-root, & .MuiAlert-action .MuiIconButton-root'

export const defineMuiAlert = (
  { Layer: { 1: Layer1, Feedback, Highlight }, Text: { TextColors } }: DesignSystem,
  { bodyXsRegular }: TypographyVariantsOptions,
): Components['MuiAlert'] => ({
  defaultProps: {
    iconMapping: {
      success: <CheckIcon fontSize="small" />,
      info: <InfoCircledIcon fontSize="small" />,
      warning: <ExclamationTriangleIcon fontSize="small" />,
      error: <ExclamationTriangleIcon fontSize="small" />,
    },
  },
  styleOverrides: {
    root: {
      ...handleBreakpoints({
        ...bodyXsRegular,
        borderWidth: OUTLINE_WIDTH,
        boxShadow: 'none',
        paddingInline: Spacing.xs,
        paddingBlockStart: 0,
        paddingBlockEnd: Spacing.xs,
      }),
      '& .MuiAlert-message': {
        flexGrow: 1,
        textWrapStyle: 'pretty',
        ...handleBreakpoints({
          paddingBlockStart: Spacing.sm,
          paddingBlockEnd: Spacing.xs,
        }),
      },
    },
    outlined: {
      backgroundColor: Layer1.Fill,
      color: TextColors.Secondary,
      [ICON_SELECTOR]: { opacity: 1 },
      '&.MuiAlert-colorInfo': {
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.Highlight },
        borderColor: Highlight.Outline,
      },
      '&.MuiAlert-colorSuccess': {
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.Feedback.Success },
        borderColor: Feedback.Success,
      },
      '&.MuiAlert-colorWarning': {
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.Feedback.Warning },
        borderColor: Feedback.Warning,
      },
      '&.MuiAlert-colorError': {
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.Feedback.Error },
        borderColor: Feedback.Error,
      },
    },
    filled: {
      [ICON_SELECTOR]: { opacity: 1 },
      '&.MuiAlert-colorInfo': {
        backgroundColor: Feedback.Info,
        color: TextColors.FilledFeedback.Highlight.Secondary,
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.FilledFeedback.Highlight.Primary },
        [FILLED_ACTION_SELECTOR]: { color: TextColors.Feedback.Inverted },
      },
      '&.MuiAlert-colorSuccess': {
        backgroundColor: Feedback.Success,
        color: TextColors.FilledFeedback.Success.Secondary,
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.FilledFeedback.Success.Primary },
        [FILLED_ACTION_SELECTOR]: { color: TextColors.Feedback.Inverted },
      },
      '&.MuiAlert-colorWarning': {
        backgroundColor: Feedback.Warning,
        color: TextColors.FilledFeedback.Warning.Secondary,
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.FilledFeedback.Warning.Primary },
        [FILLED_ACTION_SELECTOR]: { color: TextColors.FilledFeedback.Warning.Primary },
      },
      '&.MuiAlert-colorError': {
        backgroundColor: Feedback.Error,
        color: TextColors.FilledFeedback.Alert.Secondary,
        [TITLE_AND_ICON_SELECTOR]: { color: TextColors.FilledFeedback.Alert.Primary },
        [FILLED_ACTION_SELECTOR]: { color: TextColors.Feedback.Inverted },
      },
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
    action: handleBreakpoints({
      marginInlineStart: Spacing.xs,
      marginInlineEnd: 0,
      paddingInlineStart: 0,
      paddingInlineEnd: 0,
      paddingBlockStart: Spacing.sm,
      paddingBlockEnd: Spacing.xs,
    }),
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
