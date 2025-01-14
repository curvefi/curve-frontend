import { Components } from '@mui/material/styles'
import { DesignSystem } from './design'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { InfoCircledIcon } from '@ui-kit/shared/icons/InfoCircledIcon'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'

export const defineMuiAlert = ({
  Layer: { 1: Layer1, Feedback },
  Text: { TextColors },
}: DesignSystem): Components['MuiAlert'] => ({
  defaultProps: {
    iconMapping: {
      success: <CheckIcon fontSize={'small'} />,
      info: <InfoCircledIcon fontSize={'small'} />,
      warning: <ExclamationTriangleIcon fontSize={'small'} />,
      error: <ExclamationTriangleIcon fontSize={'small'} />,
    },
  },
  styleOverrides: {
    outlined: {
      backgroundColor: Layer1.Fill,
      color: TextColors.Secondary,
      '&.MuiAlert-colorInfo .MuiAlertTitle-root': { color: Feedback.Info },
      '&.MuiAlert-colorSuccess .MuiAlertTitle-root': { color: Feedback.Success },
      '&.MuiAlert-colorWarning .MuiAlertTitle-root': { color: Feedback.Warning },
      '&.MuiAlert-colorError .MuiAlertTitle-root': { color: Feedback.Error },
    },
    filled: {
      color: TextColors.Feedback.Inverted,
      '&.MuiAlert-colorInfo': { backgroundColor: Feedback.Info },
      '&.MuiAlert-colorSuccess': { backgroundColor: Feedback.Success },
      '&.MuiAlert-colorWarning': { backgroundColor: Feedback.Warning, color: TextColors.Primary },
      '&.MuiAlert-colorError': { backgroundColor: Feedback.Error },
    },
  },
})
