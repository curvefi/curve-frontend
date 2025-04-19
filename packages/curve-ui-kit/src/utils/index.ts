import { getAddress, isAddress } from 'viem'

export * from './address'
export * from './BigDecimal'
export * from './bigNumber'
export * from './shortenString'
export * from './web3'
export * from './network'
export * from './number'
export * from './searchText'

export const isCypress = typeof window !== 'undefined' && Boolean((window as { Cypress?: boolean }).Cypress)
export const isBetaDefault =
  process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname !== 'curve.fi')
export const enableLogging = isBetaDefault

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
