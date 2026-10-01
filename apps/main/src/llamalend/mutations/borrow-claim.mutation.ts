import { noop } from 'lodash'
import { useCallback } from 'react'
import { fetchBorrowClaimableCrv } from '@/llamalend/queries/borrow/borrow-claimable-crv.query'
import {
  borrowClaimValidationSuite,
  requireCollateralRewards,
} from '@/llamalend/queries/validation/borrow-claim.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { rootKeys } from '@evm-ui/queries/root-keys'
import type { Address, Hex } from '@primitives/address.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'
import { useMarketMutation } from './useMarketMutation'

type BorrowClaimMutation = Record<string, never>

type BorrowClaimOptions = {
  marketId: string | undefined
  network: { blockchainId: LlamaNetworkId; chainId: LlamaChainId }
  userAddress: Address | undefined
  crvTokenAddress: Address | undefined
}

const noFormFieldOptions = { onReset: noop }

export const useBorrowClaimCrvMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  crvTokenAddress,
}: BorrowClaimOptions) => {
  const { mutate, error, isPending } = useMarketMutation<BorrowClaimMutation>({
    network,
    marketId,
    mutationKey: [
      { ...rootKeys.userMarket({ chainId, marketId, userAddress }), name: 'collateralRewards.claimCrv' },
    ] as const,
    mutationFn: async (_, { market, userAddress }) => {
      const lendMarket = requireCollateralRewards(market)
      const claimableCrv = await fetchBorrowClaimableCrv(
        { chainId, marketId: lendMarket.id, userAddress },
        { staleTime: 0 },
      )
      assert(Number(claimableCrv) > 0, 'No claimable CRV rewards found')
      return { hash: (await lendMarket.collateralRewards.claimCrv()) as Hex }
    },
    validationSuite: borrowClaimValidationSuite,
    pendingMessage: () => t`Claiming CRV rewards...`,
    successMessage: () => t`Claimed rewards!`,
    mutationTokenAddresses: () => notFalsy(crvTokenAddress),
    ...noFormFieldOptions,
  })

  const onSubmit = useCallback(() => mutate({}), [mutate])

  return { onSubmit, mutate, error, isPending }
}
