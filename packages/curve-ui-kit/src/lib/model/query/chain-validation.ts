import { enforce, group, test } from 'vest'
import { getLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { ChainParams } from './root-keys'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const curveApiValidationGroup = <TChainId extends number, TLib extends { chainId: TChainId }>({
  chainId,
}: ChainParams<TChainId>) =>
  group('apiValidation', () => {
    test('api', 'API chain ID mismatch', () => {
      enforce(getLib('curveApi')?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const curveApiValidationSuite = createValidationSuite(
  <TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params)
  },
)

export const llamaApiValidationGroup = <TChainId extends number, TLib extends { chainId: TChainId }>({
  chainId,
}: ChainParams<TChainId>) =>
  group('apiValidation', () => {
    test('api', 'API chain ID mismatch', () => {
      enforce(getLib('llamaApi')?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const llamaApiValidationSuite = createValidationSuite(
  <TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    llamaApiValidationGroup(params)
  },
)
