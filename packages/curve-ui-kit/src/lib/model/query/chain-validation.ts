import { enforce, group, test } from 'vest'
import { getLib } from '@ui-kit/features/connect-wallet'
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

export const llamaApiValidationGroup = <TChainId extends number, TLib extends { chainId: TChainId }>({
  chainId,
}: ChainParams<TChainId>) =>
  group('apiValidation', () => {
    test('api', 'API chain ID mismatch', () => {
      enforce(getLib('llamaApi')?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })
