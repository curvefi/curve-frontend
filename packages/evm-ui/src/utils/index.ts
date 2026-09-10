import { formatUnits, getAddress, isAddress } from 'viem'
import { decimal } from '@ui/lib/decimal'

export * from './address'
export * from './web3'
export * from './network'
export * from './pagination'
export * from './average-categories'
export * from './rates'
export * from './tokens'

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

export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
