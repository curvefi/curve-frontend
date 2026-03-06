import { isAddress, zeroAddress } from 'viem'

// Must extend the n4s namespace for extensions as per https://vestjs.dev/docs/enforce/creating_custom_rules#typescript-support
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace n4s {
    interface EnforceMatchers {
      isDecimal(value: string, options?: { decimal_digits?: string }): this
      isAddress(value: string): this
      isNotZeroAddress(value: string): this
      isPositiveNumber(value: number): this
      isValidChainId(value: number): this
      isValidChainName(value: string): this
    }
  }
}

// Copied from https://github.com/validatorjs/validator.js/blob/3c857088d58197453957a2b924dfedea328003b6/src/lib/isDecimal.js#L19
function isDecimal<T>(value: T, options?: { decimal_digits?: string }): boolean {
  if (typeof value !== 'string') return false

  const decimal_digits = options?.decimal_digits || '1,'
  const blacklist = ['', '-', '+']

  const cleanStr = value.replace(/ /g, '')
  if (blacklist.includes(cleanStr)) return false

  return new RegExp(`^[-+]?([0-9]+)?(\\.[0-9]{${decimal_digits}})?$`).test(value)
}

export const extendEnforce = (enforce: typeof import('vest').enforce) =>
  enforce.extend({
    isDecimal: <T>(value: T, options?: Parameters<typeof isDecimal>[1]) => ({
      pass: isDecimal(value, options),
      message: () => 'Must be a valid decimal number',
    }),
    isAddress: <T>(value: T) => ({
      pass: !!value && typeof value === 'string' && isAddress(value),
      message: () => 'Must be a valid Ethereum address',
    }),
    isNotZeroAddress: <T>(value: T) => ({
      pass: value !== zeroAddress,
      message: () => 'Address cannot be the zero address',
    }),
    isPositiveNumber: <T>(value: T) => ({
      pass: typeof value === 'number' && value > 0,
      message: () => 'Must be a positive number',
    }),
    isValidChainId: <T>(value: T) => ({
      pass: typeof value === 'number', // && value > 0,
      message: () => 'Must be a valid chain ID',
    }),
    isValidChainName: <T>(value: T) => ({
      pass: typeof value === 'string',
      message: () => 'Must be a valid chain name',
    }),
  })
