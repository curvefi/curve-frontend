import { enforce, group, test } from 'vest'
import { getLib } from '@ui-kit/features/connect-wallet'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { chainValidationGroup } from './chain-validation'
import { ChainParams } from './root-keys'

type CurveApiOptions = { requireRpc?: boolean }

export const curveApiValidationGroup = <TChainId extends number>(
  { chainId }: ChainParams<TChainId>,
  { requireRpc = false }: CurveApiOptions = {},
) =>
  group('apiValidation', () => {
    test('api', 'API chain ID mismatch', () => {
      enforce(getLib('curveApi')?.chainId).message('Chain ID should be loaded').equals(chainId)
    })

    if (requireRpc) {
      test('rpc required', () => {
        enforce(getLib('curveApi')?.isNoRPC).message('RPC is required').equals(false)
      })
    }
  })

export const curveApiValidationSuite = createValidationSuite(
  <TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params)
  },
)

export const curveApiWithWalletValidationSuite = createValidationSuite(
  <TChainId extends number>(params: ChainParams<TChainId>) => {
    chainValidationGroup(params)
    curveApiValidationGroup(params, { requireRpc: true })
  },
)

export const llamaApiValidationGroup = <TChainId extends number>({ chainId }: ChainParams<TChainId>) =>
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
