import { enforce, group, test } from 'vest'
import { getLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { chainValidationGroup } from './chain-validation'
import { ChainParams } from './root-keys'

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

type ApiValidationParams = {
  /** The API should be fully hydrated. */
  beHydrated?: boolean
}

export const llamaApiValidationGroup = <TChainId extends number, TLib extends { chainId: TChainId }>({
  chainId,
  beHydrated,
}: ChainParams<TChainId> & ApiValidationParams) =>
  group('apiValidation', () => {
    test('api', 'API chain ID mismatch', () => {
      enforce(getLib('llamaApi')?.chainId).message('Chain ID should be loaded').equals(chainId)
    })

    if (beHydrated) {
      test('apiHydrated', 'API should be hydrated', () => {
        enforce(getLib('llamaApi')?.hydrated).message('API should be hydrated').isTrue()
      })
    }
  })

export const llamaApiValidationSuite = (apiValidationParams: ApiValidationParams = { beHydrated: false }) =>
  createValidationSuite(<TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    llamaApiValidationGroup({ ...params, ...apiValidationParams })
  })
