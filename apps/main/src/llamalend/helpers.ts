import { t } from '@ui-kit/lib/i18n'

interface CustomError extends Error {
  data?: { message: string }
  code?: string
}

export function getErrorMessage(error: CustomError | null, defaultErrorMessage?: string): string {
  let errorMessage = defaultErrorMessage ?? ''

  if (error?.message) {
    if (error.message.startsWith('user rejected transaction') || error?.code === 'ACTION_REJECTED') {
      errorMessage = t`User rejected transaction`
    } else if ('data' in error && typeof error.data?.message === 'string') {
      errorMessage = error.data.message
    } else {
      errorMessage = error.message
    }
  }
  return errorMessage
}
