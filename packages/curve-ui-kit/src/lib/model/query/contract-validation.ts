import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from '@ui-kit/lib/validation/lib'
import { chainNameValidationGroup } from './chain-name-validation'
import { ContractParams } from './root-keys'

export const contractValidationGroup = ({ blockchainId, contractAddress }: ContractParams) =>
  group('contractValidation', () => {
    chainNameValidationGroup({ blockchainId })

    test('contractAddress', () => {
      enforce(contractAddress)
        .isNotEmpty()
        .message('Contract address is required')
        .isNotZeroAddress()
        .message('Invalid contract address')
    })
  })

export const contractValidationSuite = createValidationSuite(contractValidationGroup)
