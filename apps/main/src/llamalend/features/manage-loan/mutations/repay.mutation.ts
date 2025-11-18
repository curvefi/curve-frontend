import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getLlamaMarket, updateUserEventsApi } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { invalidateUserMarketQueries } from '@/llamalend/queries/query.utils'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { useMutation } from '@tanstack/react-query'
import type { BaseConfig } from '@ui/utils'
import { notify, useConnection } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { repayFromCollateralValidationSuite } from '../queries/manage-loan.validation'

type RepayMutation = { stateCollateral: Decimal; userCollateral: Decimal; userBorrowed: Decimal }

export type RepayOptions = {
  marketId: string | null | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onRepaid?: (hash: Hex, mutation: RepayMutation & { txHash: Hex }) => void
}

const repay = async (market: LlamaMarketTemplate, { stateCollateral, userCollateral, userBorrowed }: RepayMutation) =>
  market instanceof LendMarketTemplate
    ? ((await market.leverage.repay(stateCollateral, userCollateral, userBorrowed)) as Hex)
    : market.leverageV2.hasLeverage()
      ? ((await market.leverageV2.repay(stateCollateral, userCollateral, userBorrowed)) as Hex)
      : ((await market.deleverage.repay(userCollateral)) as Hex)

export const useRepayMutation = ({ network, marketId, onRepaid }: RepayOptions) => {
  const config = useConfig()
  const { wallet } = useConnection()
  const { chainId } = network
  const userAddress = wallet?.account.address
  const mutationKey = ['manage-loan', 'repay', { chainId, marketId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: RepayMutation) => {
        assertValidity(repayFromCollateralValidationSuite, { chainId, marketId, userAddress, ...mutation })
        const market = getLlamaMarket(marketId!)
        const hash = await repay(market, mutation)
        await waitForTransactionReceipt(config, { hash })
        return hash
      },
      [chainId, config, marketId, userAddress],
    ),
    onSuccess: async (txHash, mutation) => {
      logSuccess(mutationKey, txHash)
      notify(t`Debt repaid successfully`, 'success')
      await invalidateUserMarketQueries({ marketId, userAddress })
      updateUserEventsApi(wallet!, network, getLlamaMarket(marketId!), txHash)
      onRepaid?.(txHash, { ...mutation, txHash })
    },
  })

  return { mutateAsync, error, txHash: data, isPending, isSuccess, reset }
}
