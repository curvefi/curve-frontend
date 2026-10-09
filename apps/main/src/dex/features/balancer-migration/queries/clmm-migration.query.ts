import { test } from 'vest'
import { getWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-config'
import { createEstimateGasHook } from '@evm-ui/queries/gas-info.query'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import {
  evmAddressValidationGroup,
  userAddressValidationGroup,
} from '@evm-ui/queries/validation/evm-address-validation'
import { assert } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery, q } from '@ui/features/queries/util'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { FieldsOf } from '@ui/lib/validation/types'
import { type ClmmMigrationParams, fetchClmmMigration } from '../api/clmm-migration.api'
import { fetchIsPositionApproved } from '../api/uniswap.api'

export type ClmmMigrationQueryParams = FieldsOf<ClmmMigrationParams>

export const clmmMigrationValidationSuite = createValidationSuite(
  ({ chainId, userAddress, positionManager, tokenId, tokenOut, slippage }: ClmmMigrationQueryParams) => {
    chainValidationGroup({ chainId })
    userAddressValidationGroup({ userAddress })
    evmAddressValidationGroup({ evmAddress: positionManager, fieldName: 'positionManager' })
    evmAddressValidationGroup({ evmAddress: tokenOut, fieldName: 'tokenOut' })
    test('tokenId', 'Select a Uniswap position', () => {
      enforce(tokenId).isNotEmpty()
    })
    validateSlippage({ slippage })
  },
)

export const { useQuery: useClmmMigrationRoute, fetchQuery: fetchClmmMigrationQuery } = queryFactory({
  queryKey: ({
    chainId,
    userAddress,
    positionManager,
    tokenId,
    liquidity,
    tokens,
    tokenOut,
    slippage,
    skipTokens,
  }: ClmmMigrationQueryParams) =>
    ({
      name: 'uniswapMigration.route',
      chainId,
      userAddress,
      positionManager,
      tokenId,
      liquidity,
      tokens,
      tokenOut,
      slippage,
      skipTokens,
    }) as const,
  queryFn: (params: ClmmMigrationParams) => fetchClmmMigration(params),
  category: 'dex.deposit',
  validationSuite: clmmMigrationValidationSuite,
})

/** The spender is the Enso router the quote targets. */
export const { useQuery: useClmmIsApproved } = queryFactory({
  queryKey: ({
    chainId,
    userAddress,
    positionManager,
    tokenId,
    liquidity,
    tokens,
    tokenOut,
    slippage,
    skipTokens,
  }: ClmmMigrationQueryParams) =>
    ({
      name: 'uniswapMigration.isApproved',
      chainId,
      userAddress,
      positionManager,
      tokenId,
      liquidity,
      tokens,
      tokenOut,
      slippage,
      skipTokens,
    }) as const,
  queryFn: async (params: ClmmMigrationParams) => {
    const { tx } = await fetchClmmMigrationQuery(params)
    return await fetchIsPositionApproved(assert(getWagmiConfig(), 'Wagmi config is not initialized'), {
      chainId: params.chainId,
      owner: params.userAddress,
      positionManager: params.positionManager,
      tokenId: params.tokenId,
      spender: tx.to,
    })
  },
  category: 'dex.deposit',
  validationSuite: clmmMigrationValidationSuite,
})

/** Gas of the migration from the Enso simulation; the NFT approval is not included. */
export const useClmmMigrationEstimateGas = createEstimateGasHook(
  (params: ClmmMigrationQueryParams, enabled?: boolean) =>
    mapQuery(q(useClmmMigrationRoute(params, enabled)), ({ gas }) => Number(gas)),
)
