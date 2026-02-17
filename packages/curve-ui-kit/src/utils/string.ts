import { Falsy, notFalsy } from '@curvefi/prices-api/objects.util'

/**
 * Shortens a string by displaying first and last few characters
 *
 * @param string - String to shorten
 * @param options - Configuration options for shortening
 * @returns Shortened string in format for example "0xAB...XY"
 * @example
 * // With default parameters (4 digits)
 * shortenString("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
 *
 * // With 6 digits on each side
 * shortenHash("0x1234567890abcdef1234567890abcdef12345678", { digits: 6 }) // "0x123456...345678"
 *
 */
export const shortenString = (
  string: string | undefined,
  {
    digits = 4,
  }: {
    /** Number of digits to show on each side of the shortened string (default: 4) */
    digits?: number
  } = {},
) => (string ? `${string.slice(0, digits + 2)}...${string.slice(-digits)}` : '-')

/**
 * Join button texts with commas and ampersand
 * @example joinButtonText('Approve', 'Repay', 'Withdraw')
 *  > 'Approve, Repay & Withdraw'
 * @example joinButtonText('Approve', 'Repay')
 *  > 'Approve & Repay'
 * @example joinButtonText('Approve', false, 'Borrow More`, 'Withdraw', undefined, 'Repay')
 *  > 'Approve, Borrow More, Withdraw & Repay'
 */
export const joinButtonText = (...texts: (string | Falsy)[]) =>
  notFalsy(...texts)
    .map((t, i, all) => (i ? `${i === all.length - 1 ? ' & ' : ', '}${t}` : t))
    .join('')
