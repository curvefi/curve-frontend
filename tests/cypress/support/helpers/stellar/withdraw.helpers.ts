import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { readContract } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { calculateExpectedBurn, calculateMaximumBurn } from '@/stellar/lib/amounts'
import { fetchExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { fetchPoolState, poolInput, type PoolState, TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { API_LOAD_TIMEOUT, LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalMinus, decimalSum, fromWei } from '@ui/lib/decimal'

export const fetchWithdrawState = async (pool: StellarContract, config: TestnetConfig) => {
  const [state, reserves] = await Promise.all([
    fetchPoolState(pool, config),
    readContract<bigint[]>(TEST_NETWORK, pool, 'get_balances'),
  ])
  return { ...state, reserves: reserves.map((reserve, index) => fromWei(reserve, state.coins[index].decimals)) }
}
export type WithdrawState = Awaited<ReturnType<typeof fetchWithdrawState>>

export const withdrawLpInput = () => cy.get('[data-testid="pool-withdraw-lp-input"]', LOAD_TIMEOUT)
export const withdrawSubmit = () => cy.get('[data-testid="pool-withdraw-submit"]', LOAD_TIMEOUT)
export const writeWithdrawLp = (amount: Decimal) => {
  withdrawLpInput().find('input').should('be.enabled').clear()
  withdrawLpInput().find('input').type(amount)
  withdrawLpInput().find('input').blur()
}

export const checkWithdrawDetail = (
  detail: 'expected-lp' | 'maximum-lp' | 'current-lp' | 'projected-lp',
  amount: Decimal,
) => getActionValue(`pool-withdraw-${detail}`).should('equal', formatNumber(amount, 'token.balance'))

export const checkWithdrawBalances = ({ coins, lp, reserves }: WithdrawState) => {
  checkWithdrawDetail('current-lp', lp.balance)
  withdrawLpInput().find('[data-testid="balance-value"]').should('have.attr', 'data-value', lp.balance)
  coins.forEach(({ address }, index) => {
    poolInput(address).find('[data-testid="balance-value"]').should('have.attr', 'data-value', reserves[index])
  })
}

export const fetchWithdrawPreview = async (pool: StellarContract, state: WithdrawState, amounts: Decimal[]) => {
  const quote = await fetchExpectedLp({
    network: TEST_NETWORK,
    pool,
    amounts,
    decimals: state.coins.map(coin => coin.decimals),
    supply: state.supply,
    isDeposit: false,
    maxAmounts: state.reserves,
  })
  const expected = calculateExpectedBurn(quote)
  return {
    expected,
    maximum: calculateMaximumBurn(expected, useUserProfileStore.getState().maxSlippage.stable),
    projected: decimalMinus(state.lp.balance, expected),
  }
}

export const submitWithdrawForm = ({ coins }: PoolState) => {
  withdrawSubmit().should('be.enabled').click()
  cy.get('[data-testid="toast-success"]', API_LOAD_TIMEOUT).should('contain.text', 'Withdrawal confirmed')
  withdrawLpInput().find('input').should('have.value', '')
  coins.forEach(({ address }) => {
    poolInput(address).find('input').should('have.value', '')
  })
  withdrawSubmit().should('be.disabled')
}

export const checkWithdrawResult = (
  state: WithdrawState,
  fresh: WithdrawState,
  amounts: Decimal[],
  expectedLp: Decimal,
  projectedLp: Decimal,
) => {
  checkWithdrawBalances(fresh)
  // Imbalanced withdrawals can also deduct fees from available reserves.
  fresh.reserves.forEach((reserve, index) => {
    expect(+reserve, `${state.coins[index].symbol} pool reserve`).to.be.at.most(
      +decimalMinus(state.reserves[index], amounts[index]),
    )
  })
  expect(fresh.lp.balance).to.equal(projectedLp)
  expect(fresh.supply).to.equal(decimalMinus(state.supply, expectedLp))
  expect(decimalMinus(fresh.supply, fresh.lp.balance)).to.equal(state.config.seedLock)
  fresh.coins.forEach((coin, index) => {
    expect(coin.balance, `${coin.symbol} wallet balance`).to.equal(
      decimalSum(state.coins[index].balance, amounts[index]),
    )
  })
}
