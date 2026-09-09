// eslint-disable-next-line no-restricted-imports -- This module initializes the shared enforce instance.
import { enforce as vestEnforce } from 'vest'
import { isPricesApiChain } from '@curvefi/prices-api'
import { ADDRESS_HEX_PATTERN, ZERO_ADDRESS } from '@primitives/address.utils'

// Copied from https://github.com/validatorjs/validator.js/blob/3c857088d58197453957a2b924dfedea328003b6/src/lib/isDecimal.js#L19
function isDecimal<T>(value: T, options?: { decimal_digits?: string }): boolean {
  if (typeof value !== 'string') return false

  const decimal_digits = options?.decimal_digits || '1,'
  const blacklist = ['', '-', '+']

  const cleanStr = value.replace(/ /g, '')
  if (blacklist.includes(cleanStr)) return false

  return new RegExp(`^[-+]?([0-9]+)?(\\.[0-9]{${decimal_digits}})?$`).test(value)
}

vestEnforce.extend({
  isDecimal: <T>(value: T, options?: Parameters<typeof isDecimal>[1]) => ({
    pass: isDecimal(value, options),
    message: () => 'Must be a valid decimal number',
  }),
  isAddress: <T>(value: T) => ({
    pass: typeof value === 'string' && ADDRESS_HEX_PATTERN.test(value),
    message: () => 'Must be a valid Ethereum address',
  }),
  isNotZeroAddress: <T>(value: T) => ({
    pass: value !== ZERO_ADDRESS,
    message: () => 'Address cannot be the zero address',
  }),
  isPositiveNumber: <T>(value: T) => ({
    pass: typeof value === 'number' && value > 0,
    message: () => 'Must be a positive number',
  }),
  isValidPricesApiChain: <T>(value: T) => ({
    pass: typeof value === 'string' && isPricesApiChain(value),
    message: () => 'Must be a valid chain ID',
  }),
})

export const enforce: typeof vestEnforce = vestEnforce
