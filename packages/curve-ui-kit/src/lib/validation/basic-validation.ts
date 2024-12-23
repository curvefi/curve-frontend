import { enforce } from 'vest'

// TODO: move to Token validation lib
export const tokenIdValidationFn = <T extends unknown>(value: T) => {
  enforce(value)
    .message('Token address is required')
    .isNotEmpty()
    .message('Invalid token address')
    .isAddress()
    .message('Token address cannot be zero address')
    .isNotZeroAddress()
}

export const amountValidationFn = <T extends unknown>(value: T) => {
  enforce(value)
    .message('Amount is required')
    .isNotEmpty()
    .message('Amount should be a decimal number with up to 18 decimal places')
    .isDecimal({ decimal_digits: '0,18' })
}

export const addressValidationFn = <T extends unknown>(value: T) => {
  enforce(value)
    .message('Address is required')
    .isNotEmpty()
    .message('Invalid address')
    .isAddress()
    .message('Address cannot be zero address')
    .isNotZeroAddress()
}

export const numberValidationFn = <T extends unknown>(value: T) => {
  enforce(value).message('Number is required').isNotEmpty().message('Invalid number').isNumber()
}
