import { useMemo } from 'react'
import { approveLoan, type BorrowMutation, createLoan } from '@/llamalend/mutations/create-loan.mutation'
import { fetchBorrowCreateLoanIsApproved } from '@/llamalend/queries/create-loan/borrow-create-loan-approved.query'
import { fetchLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { fetchLoanMaxReceive } from '@/llamalend/queries/create-loan/create-loan-max-receive.query'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { type LlamaApi, useConnection } from '@ui-kit/features/connect-wallet'
import { LlamaMarketType } from '@ui-kit/types/market'
import { waitFor } from '@ui-kit/utils/time.utils'

export const getActionValue = (name: string) => cy.get(`[data-testid="${name}-value"]`, LOAD_TIMEOUT)

export const checkAccordion = (leverageEnabled: boolean) => {
  // open borrow advanced settings and check all fields
  cy.contains('button', 'Health').click()

  getActionValue('borrow-band-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) to (\d(\.\d+)?)/)
  getActionValue('borrow-price-range')
    .invoke(LOAD_TIMEOUT, 'text')
    .should('match', /(\d(\.\d+)?) - (\d(\.\d+)?)/)
  getActionValue('borrow-apr').contains('%')
  getActionValue('borrow-apr-previous').contains('%')
  getActionValue('borrow-ltv').contains('%')
  getActionValue('borrow-n').contains('50')

  if (leverageEnabled) {
    getActionValue('borrow-price-impact').contains('%')
    getActionValue('borrow-slippage').contains('%')
  } else {
    getActionValue('borrow-price-impact').should('not.exist')
    getActionValue('borrow-slippage').should('not.exist')
  }
}

export const TEST_LLAMA_MARKETS = {
  [LlamaMarketType.Mint]: {
    id: 'lbtc',
    collateralAddress: '0x8236a87084f8b84306f72007f36f2618a5634494' as const, // lbtc
    collateral: '1',
    borrow: '100',
  },
  [LlamaMarketType.Lend]: {
    id: 'one-way-market-14',
    collateralAddress: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3' as const, // USDe
    collateral: '1',
    borrow: '0.9',
  },
}

export const getLlamaMarket = (llamaApi: LlamaApi | undefined, type: LlamaMarketType, id: string) =>
  ({
    [LlamaMarketType.Mint]: llamaApi?.getMintMarket,
    [LlamaMarketType.Lend]: llamaApi?.getLendMarket,
  })[type]?.(id)

export function useTestLlamaMarket(type: LlamaMarketType) {
  const { isHydrated, llamaApi } = useConnection()
  const { id } = TEST_LLAMA_MARKETS[type]
  return useMemo(() => isHydrated && getLlamaMarket(llamaApi, type, id), [isHydrated, llamaApi, type, id])
}

/**
 * Approves and creates a loan in a single flow
 */
export async function approveAndCreateLoan(
  lib: LlamaApi,
  {
    marketType,
    marketId,
    mutation,
    chainId,
  }: { marketId: string; chainId: LlamaChainId; marketType: LlamaMarketType; mutation: BorrowMutation },
) {
  const params = { ...mutation, chainId, marketId }
  const market = getLlamaMarket(lib, marketType, marketId)!

  // first approve
  await approveLoan(market, mutation)

  // wait for approval to go through
  await waitFor(() => fetchBorrowCreateLoanIsApproved(params), {
    ...LOAD_TIMEOUT,
    step: 300,
  })

  // now fetch the max receive and expected collateral, that's required by llamalend-js
  const { maxDebt } = await fetchLoanMaxReceive(params)
  if (mutation.leverageEnabled) await fetchLoanExpectedCollateral(params)

  // finally, create the loan
  return await createLoan(market, { ...mutation, debt: maxDebt })
}
