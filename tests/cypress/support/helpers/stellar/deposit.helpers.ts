import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { sendStellarTransaction, simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { fetchExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { fetchPoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { fetchTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { type PoolAmounts, poolInput, type PoolState, TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { fromEntries } from '@primitives/objects.utils'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalMinus, decimalMultiply, decimalSum, toWei } from '@ui/lib/decimal'

export const BASE_DEPOSIT_AMOUNT = '0.01' satisfies Decimal

export const allCoinDeposit = (coins: PoolState['coins']): PoolAmounts =>
  fromEntries(coins.map((coin, index) => [coin.symbol, decimalMultiply(BASE_DEPOSIT_AMOUNT, index + 1)]))

/** Seed a fresh test pool without mounting a deposit form. */
export const seedTestPool = async (pool: StellarContract, { coins, deployer: { address: account } }: TestnetConfig) => {
  const amounts = await Promise.all(
    coins.map(async (token, index) => {
      const decimals = await fetchTokenDecimals({ network: TEST_NETWORK, token })
      return BigInt(toWei(decimalMultiply(BASE_DEPOSIT_AMOUNT, index + 1), decimals))
    }),
  )
  const transaction = await simulateContractCall<bigint>(
    TEST_NETWORK,
    pool,
    'add_liquidity',
    [account, amounts, 0n, account],
    account,
  )
  return sendStellarTransaction(transaction)
}

export const fetchDepositPreview = async (
  pool: StellarContract,
  { coins, lp, supply }: PoolState,
  amounts: PoolAmounts,
) => {
  const expected = await fetchExpectedLp({
    network: TEST_NETWORK,
    pool,
    amounts: coins.map(({ symbol }) => amounts[symbol] ?? '0'),
    decimals: coins.map(({ decimals }) => decimals),
    supply,
    isDeposit: true,
  })
  return {
    expected,
    minimum: calculateMinimumMint(expected, useUserProfileStore.getState().maxSlippage.stable),
    projected: decimalSum(lp.balance, expected),
  }
}

export const depositBalancedCheckbox = () =>
  cy.get('[data-testid="pool-deposit-balanced-checkbox"]', LOAD_TIMEOUT).find('input')

export const checkBalancedDepositAmounts = (coins: PoolState['coins'], unit: number) =>
  coins.forEach(({ address, decimals }, index) => {
    poolInput(address)
      .find('input')
      .should(input => expect(+input.val()!).to.be.closeTo(unit * (index + 1), 10 ** -decimals))
  })

export const checkBalancedWalletAmounts = (coins: PoolState['coins']) =>
  checkBalancedDepositAmounts(
    coins,
    // Balanced tests deposit into a pool seeded in proportions 1:2:3.
    Math.min(...coins.map(({ balance }, index) => Number(balance) / (index + 1))),
  )

export const checkDepositSupply = (pool: StellarContract, state: PoolState, expectedLp: Decimal) =>
  cy
    .then(LOAD_TIMEOUT, () => fetchPoolSupply({ network: TEST_NETWORK, pool }, { staleTime: 0 }))
    .then(supply => {
      const seedLock = +state.supply ? '0' : state.config.seedLock
      expect(decimalMinus(supply, state.supply)).to.equal(decimalSum(expectedLp, seedLock))
      expect(decimalMinus(supply, decimalSum(state.lp.balance, expectedLp))).to.equal(state.config.seedLock)
    })

export const depositSubmit = () => cy.get('[data-testid="pool-deposit-submit"]', LOAD_TIMEOUT)
export const checkDepositDetail = (
  detail: 'expected-lp' | 'minimum-lp' | 'current-lp' | 'projected-lp' | 'seed-lock',
  amount: Decimal,
) => getActionValue(`pool-deposit-${detail}`).should('equal', formatNumber(amount, 'token.balance'))

export const checkDepositBalances = ({ coins, lp }: PoolState) => {
  checkDepositDetail('current-lp', lp.balance)
  coins.forEach(({ address, balance }) => {
    poolInput(address).find('[data-testid="balance-value"]').should('have.attr', 'data-value', balance)
  })
}

export const submitDepositForm = ({ coins }: Pick<PoolState, 'coins'>) => {
  depositSubmit().click(LOAD_TIMEOUT)
  cy.get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT).should('contain.text', 'Deposit confirmed')
  coins.forEach(({ address }) => {
    poolInput(address).find('input').should('have.value', '')
  })
  depositSubmit().should('be.disabled')
}

export const checkDepositResult = (state: PoolState, amounts: PoolAmounts, projectedLp: Decimal) =>
  checkDepositBalances({
    ...state,
    lp: { ...state.lp, balance: projectedLp },
    coins: state.coins.map(coin => ({ ...coin, balance: decimalMinus(coin.balance, amounts[coin.symbol]) })),
  })
