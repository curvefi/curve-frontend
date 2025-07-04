import { useLlammaMutation } from '@/llamalend/hooks/mutations/useLlammaMutation'
import networks from '@/loan/networks'
import { getLoanDecreaseActiveKey } from '@/loan/store/createLoanDecreaseSlice'
import type { ChainId, Llamma } from '@/loan/types/loan.types'
import { notify } from '@ui-kit/features/connect-wallet'
import { getTokens } from '@ui-kit/features/manage-soft-liquidation/helpers'

type Props = {
  /** The llamma market to repay debt for */
  market: Llamma | null
}

/** Hook for repaying debt in a llamma market */
export function useRepay({ market: llamma }: Props) {
  const { symbol } = (llamma && getTokens(llamma))?.stablecoin || {}

  const closeMutation = useLlammaMutation({
    llamma,
    mutationFn: ({ debt }: { debt: string }, { provider, curve, llamma }) => {
      const chainId = curve.chainId as ChainId
      const repayFn = networks[chainId].api.loanDecrease.repay
      const activeKey = getLoanDecreaseActiveKey(llamma, debt, false)

      return repayFn(activeKey, provider, llamma, debt, false)
    },
    pendingMessage: ({ debt }) => `Repaying debt: ${debt} ${symbol}`,
    onSuccess: ({ hash }, { debt }) => hash && notify(`Repaid debt: ${debt} ${symbol}`, 'success'),
    onError: (error) => notify(error.message, 'error'),
  })

  return closeMutation
}
