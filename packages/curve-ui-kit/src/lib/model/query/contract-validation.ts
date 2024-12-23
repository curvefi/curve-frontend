import { enforce, group, test } from 'vest'
import { createValidationSuite } from '../../validation'
import { ContractParams } from './root-keys'
import { chainNameValidationGroup } from '../query/chain-name-validation'

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
