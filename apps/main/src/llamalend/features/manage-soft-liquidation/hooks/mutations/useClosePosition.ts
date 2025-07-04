import apiLending from '@/lend/lib/apiLending'
import { useLlammaMutation } from '@/llamalend/hooks/mutations/useLlammaMutation'
import networks from '@/loan/networks'
import type { ChainId } from '@/loan/types/loan.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const handlers = {
  pendingMessage: 'Closing position',
  onSuccess: ({ hash }: { hash?: string }) => hash && notify('Position closed', 'success'),
  onError: (error: Error) => notify(error.message, 'error'),
}

/**
 * Hook for closing a mint position by liquidating the user's position
 * @param market - The mint market template to close the position for
 * @returns Mutation object for closing the position
 */
export function useClosePositionMint({ market }: { market: MintMarketTemplate | undefined }) {
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  return useLlammaMutation({
    market,
    mutationFn: async (vars: void, { provider, curve, market }) => {
      const chainId = curve.chainId as ChainId
      const liquidateFn = networks[chainId].api.loanLiquidate.liquidate

      return liquidateFn(provider, market, maxSlippage)
    },
    ...handlers,
  })
}

const { loanSelfLiquidation } = apiLending

/**
 * Hook for closing a lending position by self-liquidating the user's position
 * @param market - The lend market template to close the position for
 * @returns Mutation object for closing the position
 */
export function useClosePositionLend({ market }: { market: LendMarketTemplate | undefined }) {
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  return useLlammaMutation({
    market,
    mutationFn: async (vars: void, { provider, market }) =>
      loanSelfLiquidation.selfLiquidate(provider, market, maxSlippage),
    ...handlers,
  })
}
