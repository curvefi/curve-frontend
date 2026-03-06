import { enforce } from 'vest'

// enforce(value as any): vest narrows which validation methods are available based on the value's type.
// Passing unknown or a generic causes that narrowing to fail, removing all methods from the return type.
// These functions only validate — they don't coerce or narrow — so we use any to bypass the filtering.
// In other words, we need to cast to any to fix type errors (without really caring about the case anyway).

// TODO: move to Token validation lib
export const tokenIdValidationFn = <T>(value: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enforce(value as any)
    .message('Token address is required')
    .isNotEmpty()
    .message('Invalid token address')
    .isAddress()
    .message('Token address cannot be zero address')
    .isNotZeroAddress()
}

export const amountValidationFn = <T>(value: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enforce(value as any)
    .message('Amount is required')
    .isNotEmpty()
    .message('Amount should be a decimal number with up to 18 decimal places')
    .isDecimal({ decimal_digits: '0,18' })
}

export const addressValidationFn = <T>(value: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enforce(value as any)
    .message('Address is required')
    .isNotEmpty()
    .message('Invalid address')
    .isAddress()
    .message('Address cannot be zero address')
    .isNotZeroAddress()
}
