import { useLlammaMutation } from '@/llamalend/hooks/mutations/useLlammaMutation'
import networks from '@/loan/networks'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

type Props = {
  /** The Llamma market to close position on */
  market: Llamma | null
}

/** Mutation for closing a position in a Llamma market */
export function useClosePosition({ market: llamma }: Props) {
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const closeMutation = useLlammaMutation({
    llamma,
    mutationFn: async (vars: void, { provider, curve, llamma }) => {
      const chainId = curve.chainId as ChainId
      const liquidateFn = networks[chainId].api.loanLiquidate.liquidate

      return liquidateFn(provider, llamma, maxSlippage)
    },
    pendingMessage: 'Closing position',
    onSuccess: ({ hash }) => hash && notify('Position closed', 'success'),
    onError: (error) => notify(error.message, 'error'),
  })

  return closeMutation
}
