import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { ContractParams } from './root-keys'
import { chainNameValidationGroup } from './chain-name-validation'

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
