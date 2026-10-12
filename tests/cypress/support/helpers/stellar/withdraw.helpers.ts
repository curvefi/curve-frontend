import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import {
  readContract,
  sendStellarTransaction,
  simulateContractCall,
} from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { checkEstimatedTxCost, getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
import {
  fetchPoolState,
  poolInput,
  type PoolState,
  readPoolAmounts,
  TEST_NETWORK,
} from '@cy/support/helpers/stellar/pool.helpers'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { decimalSum, fromWei, toWei } from '@ui/lib/decimal'

export const fetchWithdrawState = async (pool: StellarContract, config: TestnetConfig) => {
  const [state, reserves] = await Promise.all([
    fetchPoolState(pool, config),
    readContract<bigint[]>(TEST_NETWORK, pool, 'get_balances'),
  ])
  return { ...state, reserves: reserves.map((reserve, index) => fromWei(reserve, state.coins[index].decimals)) }
}
export type WithdrawState = Awaited<ReturnType<typeof fetchWithdrawState>>

/** Fixture setup: transfer most of the seeded LP to the issuer to keep one-coin withdrawal price impact acceptable. */
export const seedPoolAndTransferMostLpToIssuer = async (
  pool: StellarContract,
  config: TestnetConfig,
  ratio = 9n / 10n,
) => {
  await seedTestPool(pool, config)
  const { lp } = await fetchWithdrawState(pool, config)
  const { issuer, deployer } = config
  await sendStellarTransaction(
    await simulateContractCall<void>(
      TEST_NETWORK,
      pool,
      'transfer',
      [deployer.address, issuer, BigInt(toWei(lp.balance, LP_TOKEN_DECIMALS)) * ratio],
      deployer.address,
    ),
  )
}

export const withdrawLpInput = () => cy.get('[data-testid="pool-withdraw-lp-input"]', TIMEOUTS['ui.render'])
export const withdrawSubmit = () => cy.get('[data-testid="pool-withdraw-submit"]', TIMEOUTS['ui.render'])
export const writeWithdrawLp = (amount: Decimal) => {
  withdrawLpInput().find('input').should('be.enabled').clear()
  withdrawLpInput().find('input').type(amount)
  withdrawLpInput().find('input').blur()
}

type WithdrawDetail = 'expected-lp' | 'maximum-lp' | 'current-lp' | 'projected-lp'

export const getWithdrawDetail = (detail: WithdrawDetail) =>
  getActionValue(`pool-withdraw-${detail}`, detail === 'current-lp' ? 'stellar.read' : 'stellar.simulation')

export const checkWithdrawDetail = (detail: WithdrawDetail, amount: Decimal) =>
  getWithdrawDetail(detail).should('equal', formatNumber(amount, 'token.balance'))

export const checkWithdrawBalances = ({ coins, lp }: WithdrawState) => {
  checkWithdrawDetail('current-lp', lp.balance)
  withdrawLpInput().find('[data-testid="balance-value"]').should('have.attr', 'data-value', lp.balance)
  coins.forEach(({ address }) => {
    poolInput(address).find('[data-testid="balance-value"]').invoke('attr', 'data-value').should('not.be.empty')
  })
}

export const selectWithdrawMax = ({ coins, lp }: PoolState, coin: PoolState['coins'][number]) => {
  poolInput(coin.address)
    .find('[data-testid="balance-value"]')
    .invoke('attr', 'data-value')
    .should('not.be.empty')
    .then(maxAmount => {
      poolInput(coin.address).find('[data-testid="input-chip-Max"]').click()
      coins.map(({ address }) =>
        poolInput(address)
          .find('input')
          .should('have.value', address === coin.address ? maxAmount : '0'),
      )
    })
  withdrawLpInput().find('input').should('have.value', lp.balance)
  checkWithdrawDetail('expected-lp', lp.balance)
  checkWithdrawDetail('maximum-lp', lp.balance)
  checkWithdrawDetail('projected-lp', '0')
}

export const checkPartialWithdrawQuote = ({ lp }: PoolState, lpBudget: Decimal) => {
  withdrawSubmit().should('be.enabled')
  getWithdrawDetail('expected-lp').should(value => {
    expect(Number(value)).to.be.greaterThan(0).and.lessThan(+lp.balance)
  })
  getWithdrawDetail('maximum-lp').should(value => {
    expect(Number(value)).to.be.greaterThan(0).and.at.most(+lpBudget)
  })
}

export const submitWithdrawForm = ({ coins }: PoolState) => {
  withdrawSubmit().should('be.enabled').click()
  cy.get('[data-testid="toast-success"]', TIMEOUTS['stellar.confirmation']).should(
    'contain.text',
    'Withdrawal confirmed',
  )
  withdrawLpInput().find('input').should('have.value', '')
  coins.forEach(({ address }) => {
    poolInput(address).find('input').should('have.value', '')
  })
  withdrawSubmit().should('be.disabled')
}

/** Check the remaining LP, then use the Deposit tab to check the received tokens in the wallet. */
export const checkWithdrawResult = ({ coins }: PoolState, amounts: Decimal[], projectedLp: string) => {
  getWithdrawDetail('current-lp').should('equal', projectedLp)
  withdrawLpInput()
    .find('[data-testid="balance-value"]')
    .invoke('attr', 'data-value')
    .should(value => {
      expect(formatNumber(value as Decimal, 'token.balance')).to.equal(projectedLp)
      // A full withdrawal must leave exactly zero, including LP dust below display precision.
      if (projectedLp === '0') expect(value).to.equal('0')
    })
  cy.get('[data-testid="tab-deposit"]', TIMEOUTS['ui.interaction']).click()
  coins.forEach(({ address, balance }, index) => {
    poolInput(address)
      .find('[data-testid="balance-value"]')
      .should('have.attr', 'data-value', decimalSum(balance, amounts[index]))
  })
}

/** Capture the UI preview, submit, and verify the displayed LP and token balances. */
export const submitWithdrawAndCheck = (state: PoolState) =>
  readPoolAmounts(state.coins).then(amounts =>
    getWithdrawDetail('projected-lp')
      .should(value => expect(Number(value)).to.be.within(0, +state.lp.balance))
      .then(projected => {
        checkEstimatedTxCost({ category: 'stellar.simulation' })
        submitWithdrawForm(state)
        checkWithdrawResult(state, amounts, projected!)
      }),
  )
