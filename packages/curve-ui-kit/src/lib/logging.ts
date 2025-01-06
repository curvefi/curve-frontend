import type { MutationKey, QueryKey } from '@tanstack/react-query'

enum LogStatus {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  SETTLED = 'settled',
  QUERY = 'query',
  MUTATION = 'mutation',
  LOADING = 'loading',
  IDLE = 'idle',
  STALE = 'stale',
  FETCHING = 'fetching',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export function log(
  key: string | QueryKey | MutationKey | string[],
  status?: LogStatus | string | any,
  ...args: unknown[]
) {
  if (process.env.NODE_ENV !== 'development') return

  const timestamp = new Date().toISOString()
  const keyArray = typeof key === 'string' ? key.split('.') : Array.isArray(key) ? key : [key]

  const getStatusStyle = (status?: LogStatus | string) => {
    if (!status) return ''
    switch (String(status).toLowerCase()) {
      case LogStatus.ERROR:
        return 'background-color: #ff6b6b; color: #ffffff; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.SUCCESS:
        return 'background-color: #51cf66; color: #ffffff; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.WARNING:
      case LogStatus.MUTATION:
        return 'background-color: #feca57; color: #ffffff; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.INFO:
      case LogStatus.QUERY:
        return 'background-color: #e3f2fd; color: #1976d2; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.SETTLED:
        return 'background-color: #f3e5f5; color: #7b1fa2; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.LOADING:
      case LogStatus.FETCHING:
        return 'background-color: #e0f7fa; color: #0097a7; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.IDLE:
      case LogStatus.STALE:
      case LogStatus.PAUSED:
      case LogStatus.CANCELLED:
        return 'background-color: #f5f5f5; color: #616161; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      default:
        return 'color: inherit;'
    }
  }

  const formatKeyArray = (keyArray: unknown[]): [string, string[]] => {
    let formattedString = ''
    const styles: string[] = []

    keyArray.forEach((part, index) => {
      if (index > 0) {
        formattedString += '%c → '
        styles.push('color: #666; font-size: 0.75em;')
      }
      formattedString += `%c${typeof part === 'string' ? part : JSON.stringify(part)}`
      styles.push('color: #4CAF50; font-weight: bold;')
    })

    return [formattedString, styles]
  }

  const logMethod = (status?: LogStatus | string) => {
    switch (String(status).toLowerCase()) {
      case LogStatus.ERROR:
        return console.error
      case LogStatus.WARNING:
      case LogStatus.MUTATION:
        return console.warn
      case LogStatus.INFO:
      case LogStatus.QUERY:
        return console.info
      case LogStatus.SUCCESS:
        return console.log
      default:
        return console.log
    }
  }

  const logger = logMethod(status)

  const hasDefinedStatus = status && Object.values(LogStatus).includes(status as LogStatus)
  const [formattedKeyString, keyStyles] = formatKeyArray(keyArray)
  const restArgs = hasDefinedStatus ? args : [status, ...args]
  const argsFormat = restArgs.length && `%c (%c${restArgs.map((i) => JSON.stringify(i)).join(', ')}%c)`
  const format = `%cDApp%c @ %c${timestamp}%c -> ${hasDefinedStatus ? `%c${status} ` : ''}${formattedKeyString}${argsFormat ?? ''}`
  logger(
    format,
    'background: #1e63e9; color: white; padding: 2px 4px; border-radius: 3px;', // DApp
    'color: #666; font-weight: bold;', // @
    'color: #2196F3;', // timestamp
    'color: #666;', // ->
    ...(hasDefinedStatus ? [getStatusStyle(status), 'color: #4CAF50; font-weight: bold;'] : []), // status
    ...keyStyles, // key
    ...(restArgs.length ? ['color: #fff;', 'color: #666;', 'color: #fff;'] : []), // args
  )
}

export const logQuery = (key: QueryKey, ...args: unknown[]) => log(key, LogStatus.QUERY, ...args)
export const logMutation = (key: MutationKey, ...args: unknown[]) => log(key, LogStatus.MUTATION, ...args)
export const logError = (key: QueryKey | MutationKey, ...args: unknown[]) => log(key, LogStatus.ERROR, ...args)
export const logSuccess = (key: QueryKey | MutationKey, ...args: unknown[]) => log(key, LogStatus.SUCCESS, ...args)
