import { enforce } from '@ui/lib/validation/enforce-extension'

// TODO: move to Token validation lib
export const tokenIdValidationFn = (value: unknown) => {
  enforce(value)
    .message('Token address is required')
    .isNotEmpty()
    .message('Invalid token address')
    .isAddress()
    .message('Token address cannot be zero address')
    .isNotZeroAddress()
}

export const amountValidationFn = (value: unknown) => {
  enforce(value)
    .message('Amount is required')
    .isNotEmpty()
    .message('Amount should be a decimal number with up to 18 decimal places')
    .isDecimal({ decimal_digits: '0,18' })
}

export const addressValidationFn = (value: unknown) => {
  enforce(value)
    .message('Address is required')
    .isNotEmpty()
    .message('Invalid address')
    .isAddress()
    .message('Address cannot be zero address')
    .isNotZeroAddress()
}
