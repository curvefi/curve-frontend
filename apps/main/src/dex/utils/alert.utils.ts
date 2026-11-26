import type { AlertType } from '@/dex/types/main.types'
import type { AlertColor } from '@mui/material/Alert'

export const alertTypeToSeverity: Record<AlertType, AlertColor> = {
  danger: 'error',
  error: 'error',
  warning: 'warning',
  info: 'info',
  '': 'info',
}
