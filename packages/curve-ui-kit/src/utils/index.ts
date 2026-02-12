import { getAddress, isAddress } from 'viem'

export * from './array'
export * from './address'
export * from './bigNumber'
export * from './env'
export * from './shortenString'
export * from './web3'
export * from './network'
export * from './number'
export * from './decimal'
export * from './searchText'
export * from './mui'
export * from './errors'

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
