import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { sendStellarTransaction, simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { fetchTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { oneDecimal } from '@cy/support/generators'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { type PoolAmounts, poolInput, type PoolState, TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { fromEntries } from '@primitives/objects.utils'
import { decimalMinus, decimalMultiply, toWei } from '@ui/lib/decimal'

/** Seed and balanced deposits use coin proportions 1:2:3. */
export const allCoinDeposit = (coins: PoolState['coins'], unit = oneDecimal(0.01, 0.05)): PoolAmounts =>
  fromEntries(coins.map((coin, index) => [coin.symbol, decimalMultiply(unit, index + 1)]))

/** Seed a fresh test pool without mounting a deposit form. */
export const seedTestPool = async (pool: StellarContract, { coins, deployer: { address: account } }: TestnetConfig) => {
  const unit = oneDecimal(0.01, 0.05)
  const amounts = await Promise.all(
    coins.map(async (token, index) => {
      const decimals = await fetchTokenDecimals({ network: TEST_NETWORK, token })
      return BigInt(toWei(decimalMultiply(unit, index + 1), decimals))
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

export const depositBalancedCheckbox = () =>
  cy.get('[data-testid="pool-deposit-balanced-checkbox"]', TIMEOUTS['ui.render']).find('input')

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

export const depositSubmit = () => cy.get('[data-testid="pool-deposit-submit"]', TIMEOUTS['ui.render'])
export const checkDepositDetail = (
  detail: 'expected-lp' | 'minimum-lp' | 'current-lp' | 'projected-lp' | 'seed-lock',
  amount: Decimal,
) =>
  getActionValue(`pool-deposit-${detail}`, detail === 'current-lp' ? 'stellar.read' : 'stellar.simulation').should(
    'equal',
    formatNumber(amount, 'token.balance'),
  )

export const checkDepositBalances = ({ coins, lp }: PoolState) => {
  checkDepositDetail('current-lp', lp.balance)
  coins.forEach(({ address, balance }) => {
    poolInput(address).find('[data-testid="balance-value"]').should('have.attr', 'data-value', balance)
  })
}

export const submitDepositForm = ({ coins }: Pick<PoolState, 'coins'>) => {
  getActionValue('pool-deposit-expected-lp', 'stellar.simulation')
    .should(value => expect(Number(value)).to.be.greaterThan(0))
    .then(expected =>
      getActionValue('borrow-slippage', 'ui.interaction').then(slippage => {
        const quote = Number(expected)
        const minimum = quote * (1 - Number.parseFloat(slippage!) / 100)
        // LP values show five significant digits; slippage shows two decimal places.
        const tolerance = 10 ** (Math.floor(Math.log10(quote)) - 4) + (quote * 0.005) / 100
        getActionValue('pool-deposit-minimum-lp', 'stellar.simulation').should(value =>
          expect(Number(value), 'minimum LP after slippage').to.be.closeTo(minimum, tolerance),
        )
      }),
    )
  submitAndExpectToast(
    () => depositSubmit().click(TIMEOUTS['ui.interaction']),
    { message: 'Deposit confirmed' },
    'stellar.confirmation',
  )
  coins.forEach(({ address }) => {
    poolInput(address).find('input').should('have.value', '')
  })
  depositSubmit().should('be.disabled')
}

/** Submit through the form and check its LP and token balance refresh. */
export const submitDepositAndCheck = (state: PoolState, amounts: PoolAmounts) => {
  depositSubmit().should('be.enabled')
  return getActionValue('pool-deposit-projected-lp', 'stellar.simulation')
    .should(value => expect(Number(value)).to.be.greaterThan(+state.lp.balance))
    .then(projected => {
      submitDepositForm(state)
      getActionValue('pool-deposit-current-lp', 'stellar.read').should('equal', projected)
      state.coins.map(({ address, symbol, balance }) =>
        poolInput(address)
          .find('[data-testid="balance-value"]')
          .should('have.attr', 'data-value', decimalMinus(balance, amounts[symbol])),
      )
    })
}
