import { t } from '@ui-kit/lib/i18n'

interface CustomError extends Error {
  data?: { message: string }
  code?: string
}

/**
 * TODO: this function was deduplicated from four different apps into ui-kit for FormAlerts.tsx, but it's rather ugly.
 * A future PR will need to properly get error messages and dedupe the whole AlertFormError.tsx shebang.
 */
export function getErrorMessage(error: CustomError | null, defaultErrorMessage?: string): string {
  let errorMessage = defaultErrorMessage ?? ''

  if (error?.message) {
    if (error.message.includes('user rejected transaction') || error?.code === 'ACTION_REJECTED') {
      errorMessage = t`User rejected transaction`
    } else if (error.message.includes('Bad swap type')) {
      errorMessage = t`Swap route is not available on Curve. Try an aggregator.`
    } else if ('data' in error && typeof error.data?.message === 'string') {
      errorMessage = error.data.message
    } else {
      errorMessage = error.message
    }
  }
  return errorMessage
}
