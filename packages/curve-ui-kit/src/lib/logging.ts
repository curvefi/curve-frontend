import type { MutationKey, QueryKey } from '@tanstack/react-query'
import { enableLogging, isCypress } from '@ui-kit/utils/env'

export enum LogStatus {
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

const isCypressOpenMode = (window as unknown as { Cypress?: { config?: (key: string) => unknown } }).Cypress?.config?.(
  'isInteractive',
)

const getStatusStyle = (status: LogStatus) => {
  const style = 'font-weight: bold; padding: 2px 4px; border-radius: 3px;'
  switch (status) {
    case LogStatus.ERROR:
      return `background-color: #ff6b6b; color: #ffffff; ${style}`
    case LogStatus.SUCCESS:
      return `background-color: #51cf66; color: #ffffff; ${style}`
    case LogStatus.WARNING:
    case LogStatus.MUTATION:
      return `background-color: #feca57; color: #ffffff; ${style}`
    case LogStatus.INFO:
    case LogStatus.QUERY:
      return `background-color: #e3f2fd; color: #1976d2; ${style}`
    case LogStatus.SETTLED:
      return `background-color: #f3e5f5; color: #7b1fa2; ${style}`
    case LogStatus.LOADING:
    case LogStatus.FETCHING:
      return `background-color: #e0f7fa; color: #0097a7; ${style}`
    case LogStatus.IDLE:
    case LogStatus.STALE:
    case LogStatus.PAUSED:
    case LogStatus.CANCELLED:
      return `background-color: #f5f5f5; color: #616161; ${style}`
    default:
      return 'color: inherit;'
  }
}

// Wagmi uses bigints in query keys and args, so need to add in serialization support
const stringify = (obj: unknown) =>
  JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value))

function argToString(i: unknown, max = 200, trailing = 3) {
  let str
  try {
    str = stringify(i)
  } catch {
    return String(i)
  }
  if (str.length > max) {
    str = `${str.slice(0, max - trailing)}...${str.slice(-trailing)}`
  }
  if (Array.isArray(i)) {
    str = `${i.length} item${i.length > 1 ? 's' : ''}: ${str}`
  }
  return str.replaceAll('%', '%%')
}

type LogKey = string | QueryKey | MutationKey | string[]

export function log(key: LogKey, status?: LogStatus | unknown, ...args: unknown[]) {
  if (!enableLogging) return

  const timestamp = new Date().toISOString()
  const keyArray = typeof key === 'string' ? key.split('.') : Array.isArray(key) ? key : [key]

  const formatKeyArray = (keyArray: unknown[]): [string, string[]] => {
    let formattedString = ''
    const styles: string[] = []

    keyArray.forEach((part, index) => {
      if (index > 0) {
        formattedString += '%c → '
        styles.push('color: #666; font-size: 0.75em;')
      }
      formattedString += `%c${typeof part === 'string' ? part : stringify(part)}`
      styles.push('color: #4CAF50; font-weight: bold;')
    })

    return [formattedString, styles]
  }

  const logMethod = (status: LogStatus | unknown) => {
    switch (status) {
      case LogStatus.ERROR:
        return console.error
      case LogStatus.WARNING:
      case LogStatus.MUTATION:
        return console.warn
      default:
        return console.info
    }
  }
  if (isCypress && !isCypressOpenMode) {
    // disable formatting when on cypress or server side. Electron prints logs to the output, but formatting breaks.
    return logMethod(status)(stringify({ status, keyArray, args }))
  }

  const hasDefinedStatus = status && Object.values(LogStatus).includes(status as LogStatus)
  const [formattedKeyString, keyStyles] = formatKeyArray(keyArray)
  const restArgs = (hasDefinedStatus ? args : [status, ...args]).filter((x) => x != null)
  const argsFormat = restArgs.length ? `%c (%c${restArgs.map((i) => argToString(i)).join(', ')}%c)` : ''
  const format = `%cDApp%c @ %c${timestamp}%c -> ${hasDefinedStatus ? `%c${status}%c ` : ''}${formattedKeyString}${argsFormat}`
  const styles = [
    'background: #1e63e9; color: white; padding: 2px 4px; border-radius: 3px;', // DApp
    'color: #666; font-weight: bold;', // @
    'color: #2196F3;', // timestamp
    'color: #666;', // ->
    ...(hasDefinedStatus ? [getStatusStyle(status as LogStatus), 'color: #4CAF50; font-weight: bold;'] : []), // status
    ...keyStyles, // key
    ...(restArgs.length ? ['color: #fff;', 'color: #666;', 'color: #fff;'] : []), // args
  ]
  logMethod(status)(format, ...styles)
}

export const logQuery = (key: LogKey, ...args: unknown[]) => log(key, LogStatus.QUERY, ...args)
export const logMutation = (key: LogKey, ...args: unknown[]) => log(key, LogStatus.MUTATION, ...args)
export const logError = (key: LogKey, ...args: unknown[]) => log(key, LogStatus.ERROR, ...args)
export const logSuccess = (key: LogKey, ...args: unknown[]) => log(key, LogStatus.SUCCESS, ...args)
