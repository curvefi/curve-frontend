import { getAddress, isAddress } from 'viem'

export * from './array'
export * from './address'
export * from './bigNumber'
export * from './shortenString'
export * from './web3'
export * from './network'
export * from './number'
export * from './decimal'
export * from './searchText'
export * from './mui'

export enum ReleaseChannel {
  Beta = 'Beta',
  Stable = 'Stable',
  Legacy = 'Legacy',
}

export const isCypress = Boolean((window as { Cypress?: unknown }).Cypress)
export const noCypressTestConnector = Boolean((window as { CypressNoTestConnector?: unknown }).CypressNoTestConnector)

export const isPreviewHost = window.location.hostname.includes('vercel.app')

const isDefaultBeta =
  process.env.NODE_ENV === 'development' ||
  window.localStorage.getItem('developer') || // allow devs to test alpha features in prod by setting localStorage
  (window.location.hostname !== 'curve.finance' && window.location.hostname !== 'www.curve.finance')

export const defaultReleaseChannel = isDefaultBeta ? ReleaseChannel.Beta : ReleaseChannel.Stable
export const enableLogging = isDefaultBeta

/**
 * Copies text to clipboard with Ethereum address checksumming
 * @param text - The text to copy to clipboard
 * @returns Promise resolving to true if copy was successful, false otherwise
 * @todo Potentially show a snackbar of the copied value
 */
export async function copyToClipboard(text: string) {
  // Check if the text is an Ethereum address and apply checksumming if it is
  if (isAddress(text)) {
    try {
      text = getAddress(text)
    } catch (error) {
      console.warn('Failed to checksum address', error)
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.warn('Copy to clipboard failed', error)
    return false
  }
}

type Falsey = null | undefined | 0 | false | ''

/**
 * Asserts that a value is truthy, and returns the value if so.
 * Throws an error with the provided message if the value is falsy.
 */
export function assert<T>(value: T | Falsey, message: string) {
  if (!value) {
    throw new Error(message)
  }
  return value
}
