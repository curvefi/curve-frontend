import apiLending from '@/lend/lib/apiLending'
import { useLlammaMutation } from '@/llamalend/hooks/mutations/useLlammaMutation'
import networks from '@/loan/networks'
import { getLoanDecreaseActiveKey } from '@/loan/store/createLoanDecreaseSlice'
import type { ChainId } from '@/loan/types/loan.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { notify } from '@ui-kit/features/connect-wallet'
import { getTokens } from '@ui-kit/features/manage-soft-liquidation/helpers'
import type { Market } from '@ui-kit/features/manage-soft-liquidation/types'

const handlers = (symbol: string = '?') => ({
  pendingMessage: ({ debt }: { debt: string }) => `Repaying debt: ${debt} ${symbol}`,
  onSuccess: ({ hash }: { hash?: string }, { debt }: { debt: string }) =>
    hash && notify(`Repaid debt: ${debt} ${symbol}`, 'success'),
  onError: (error: Error) => notify(error.message, 'error'),
})

/**
 * Extracts the stablecoin symbol from a market
 * @param market - The market to extract the symbol from
 * @returns The stablecoin symbol or undefined if market is not available
 */
const getSymbol = (market: Market | undefined) => (market && getTokens(market))?.stablecoin?.symbol

export function useRepayMint({ market }: { market: MintMarketTemplate | undefined }) {
  const symbol = getSymbol(market)

  return useLlammaMutation({
    market,
    mutationFn: ({ debt }: { debt: string }, { provider, curve, market }) => {
      const chainId = curve.chainId as ChainId
      const repayFn = networks[chainId].api.loanDecrease.repay
      const activeKey = getLoanDecreaseActiveKey(market, debt, false)

      return repayFn(activeKey, provider, market, debt, false)
    },
    ...handlers(symbol),
  })
}

const { loanRepay } = apiLending

export function useRepayLend({ market }: { market: LendMarketTemplate | undefined }) {
  const symbol = getSymbol(market)

  return useLlammaMutation({
    market,
    mutationFn: ({ debt }: { debt: string }, { provider, curve, market }) => {
      throw new Error('Not yet implemented')

      // loanRepay.repay(
      //   activeKey,
      //   provider,
      //   market,
      //   stateCollateral,
      //   userCollateral,
      //   userBorrowed,
      //   isFullRepay,
      //   maxSlippage,
      //   swapRequired,
      // )

      return Promise.resolve({ hash: '' })
    },
    ...handlers(symbol),
  })
}
