import { useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import type { Decimal } from '@ui-kit/utils'
import type { ImproveHealthProps } from '..'
import type { MarketParams } from '../types'
import { useDebtToken } from './useDebtToken'
import { useRepayMutation } from '@/llamalend/features/manage-loan/mutations/repay.mutation'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { BaseConfig } from '@ui/utils'
import type { INetworkName, IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'

/** Hook to cobble up the improve health tab */
export function useImproveHealthTab(params: MarketParams): ImproveHealthProps {
  const { address: userAddress } = useAccount()
  const { data: userBalances } = useUserBalances({ chainId: params.chainId, poolId: params.marketId, userAddress })

  const debtToken = useDebtToken(params)

  const { data: dexNetwork } = useNetworkByChain({ chainId: params.chainId })

  const repay = useRepayMutation({
    marketId: params.marketId,
    network: dexNetwork as BaseConfig<INetworkName, LlamaChainId>,
  })
  const onRepay = useCallback(
    (debt: Decimal) => {
      void repay.mutateAsync({
        stateCollateral: '0' as Decimal,
        userCollateral: '0' as Decimal,
        userBorrowed: debt,
      })
    },
    [repay],
  )

  return {
    debtToken,
    userBalance: userBalances?.borrowed,
    status: repay.isPending ? 'repay' : 'idle',
    onDebtBalance: () => {}, // TODO: Implement for new health prediction
    onRepay,
    onApproveLimited: () => {}, // TODO: Implement approve flow
    onApproveInfinite: () => {}, // TODO: Implement approve flow
  }
}
