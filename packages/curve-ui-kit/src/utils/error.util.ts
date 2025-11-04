import { notify } from '@ui-kit/features/connect-wallet'
import { shouldShowErrors } from '@ui-kit/hooks/useLocalStorage'

const IGNORED_ERROR_MESSAGES = [
  'network error',
  'Error in input stream',
  'NetworkError',
  'AbortError',
  'ChunkLoadError',
]

export const errorFallback = (error: unknown) => {
  console.error(error)
  if (!shouldShowErrors()) return
  const { message = 'An unknown error occurred' } = error as Error
  const { name } = error as DOMException
  if (IGNORED_ERROR_MESSAGES.find((ignored) => message.startsWith(ignored) || name === ignored)) return
  notify(message, 'error')
}
