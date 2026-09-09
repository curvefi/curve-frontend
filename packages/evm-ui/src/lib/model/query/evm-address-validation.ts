import { group, skipWhen, test } from 'vest'
import { isAddress } from 'viem'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { UserParams } from './root-keys'

type EvmAddressValidationParams<T extends string, TField extends string = 'evmAddress'> = {
  evmAddress?: T | null
  fieldName?: TField
  required?: boolean
}

export const evmAddressValidationGroup = <T extends string, TField extends string = 'evmAddress'>({
  evmAddress,
  fieldName,
  required = true,
}: EvmAddressValidationParams<T, TField>) => {
  const field = fieldName ?? 'evmAddress'
  return group(`${field}Validation`, () => {
    skipWhen(
      () => !required && !evmAddress,
      () => {
        test(field, 'Address is required', () => {
          enforce(evmAddress).isNotEmpty()
        })

        test(field, 'Invalid EVM address', () => {
          if (evmAddress) {
            enforce(isAddress(evmAddress)).equals(true)
          }
        })
      },
    )
  })
}

export const userAddressValidationGroup = <T extends string>({
  userAddress,
  required = true,
}: UserParams<T> & { required?: boolean }) =>
  evmAddressValidationGroup({ evmAddress: userAddress, fieldName: 'userAddress', required })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
