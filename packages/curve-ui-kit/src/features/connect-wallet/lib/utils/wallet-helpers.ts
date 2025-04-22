import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const timeout = (message: string, timeoutMs: number) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))

export const withTimeout = <T>(
  connectPromise: Promise<T>,
  message = t`Timeout connecting wallet`,
  timeoutMs = REFRESH_INTERVAL['3s'],
): Promise<T> => Promise.race([connectPromise, timeout(message, timeoutMs)])
