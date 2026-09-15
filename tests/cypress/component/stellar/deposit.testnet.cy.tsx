import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { oneOf } from '@cy/support/generators'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import {
  checkDepositBalances,
  checkDepositDetail,
  type DepositAmounts,
  type DepositState,
  depositInput,
  depositSubmit,
  fetchDepositPreview,
  fetchDepositState,
  submitDepositForm,
  TEST_NETWORK,
  writeDepositForm,
} from '@cy/support/helpers/stellar/deposit.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import { assert, fromEntries } from '@primitives/objects.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { decimalMinus, decimalSum, fromWei } from '@ui/lib/decimal'

const balancedDeposit = (coins: DepositState['coins']): DepositAmounts =>
  fromEntries(coins.map(c => [c.symbol, '0.01']))
const singleCoinDeposit = (coins: DepositState['coins']): DepositAmounts =>
  fromEntries([[oneOf(...coins).symbol, '0.01']])
const zeroDeposit = (coins: DepositState['coins']): DepositAmounts => fromEntries(coins.map(c => [c.symbol, '0']))

describe('Stellar testnet deposit', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: DepositState

  before(() => {
    queryClient.clear()
    getTestnetConfig()
      .then(config => {
        testnetConfig = config
        return connectTestWallet(config)
      })
      .then(TRANSACTION_LOAD_TIMEOUT, () => deployTestPool(testnetConfig))
      .then(LOAD_TIMEOUT, deployedPool => {
        pool = deployedPool
        return fetchDepositState(pool, testnetConfig)
      })
      .then(initialState => {
        state = initialState
      })
  })

  beforeEach(() => {
    queryClient.clear()
    cy.intercept('GET', 'https://api.testnet.stellarindex.io/v1/price*', { statusCode: 404 })
    cy.then(() => connectTestWallet(testnetConfig))
  })

  it('requires a connected wallet', () => {
    const { coins } = state
    cy.mount(
      <StellarTestWrapper>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    coins.forEach(({ address }) => {
      depositInput(address).should('be.visible')
    })
    cy.get('[data-testid="pool-deposit-connect-wallet"]', LOAD_TIMEOUT).should('be.enabled')
    depositSubmit().should('not.exist')
  })

  it('loads pool balances and rejects an empty or zero deposit', () => {
    const { deployer } = testnetConfig
    cy.mount(
      <StellarTestWrapper address={deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    checkDepositBalances(state)
    depositSubmit().should('be.disabled')
    writeDepositForm(state.coins, zeroDeposit(state.coins))
    cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
      .should('be.visible')
      .and('contain.text', 'Enter an amount to deposit')
    depositSubmit().should('be.disabled')
  })

  it('rejects amounts exceeding wallet balances and token precision', () => {
    const { deployer } = testnetConfig
    cy.mount(
      <StellarTestWrapper address={deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    checkDepositBalances(state)
    state.coins.forEach(({ address, symbol, balance, decimals }) => {
      writeDepositForm(state.coins, { ...balancedDeposit(state.coins), [symbol]: decimalSum(balance, '1') })
      depositInput(address)
        .find('[data-testid="helper-message-error"]')
        .should('be.visible')
        .and('contain.text', 'Insufficient token balance')
      depositSubmit().should('be.disabled')
      writeDepositForm(state.coins, { [symbol]: fromWei('1', decimals + 1) })
      depositInput(address)
        .find('[data-testid="helper-message-error"]')
        .should('be.visible')
        .and('contain.text', 'Amount exceeds token decimal precision')
      depositSubmit().should('be.disabled')
    })
  })

  it('fills each coin balance with Max', () => {
    const { deployer } = testnetConfig
    cy.mount(
      <StellarTestWrapper address={deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    checkDepositBalances(state)
    state.coins.forEach(({ address, balance }) => {
      depositInput(address).find('[data-testid="input-chip-Max"]').click()
      depositInput(address).find('input').should('have.value', balance)
    })
  })

  it('requires every coin in the seed deposit', () => {
    const { deployer } = testnetConfig
    expect(state.supply, 'new pool supply').to.equal('0')
    expect(state.lp.balance, 'new pool LP balance').to.equal('0')
    cy.mount(
      <StellarTestWrapper address={deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    cy.get('[data-testid="pool-deposit-seed-alert"]', LOAD_TIMEOUT).should('be.visible')
    checkDepositDetail('seed-lock', state.config.seedLock)
    state.coins.forEach(({ address, symbol }) => {
      writeDepositForm(state.coins, { ...balancedDeposit(state.coins), [symbol]: '0' })
      cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
        .should('be.visible')
        .and('contain.text', 'Seed deposits require a positive amount of every coin')
      depositSubmit().should('be.disabled')
      depositInput(address).find('input').clear().blur()
      cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
        .should('be.visible')
        .and('contain.text', 'Seed deposits require a positive amount of every coin')
      depositSubmit().should('be.disabled')
    })
  })

  ;[
    { label: 'the initial seed', amounts: balancedDeposit, isSeed: true },
    { label: 'all three coins', amounts: balancedDeposit, isSeed: false },
    { label: 'a single coin', amounts: singleCoinDeposit, isSeed: false },
  ].forEach(({ label, amounts: getAmounts, isSeed }) => {
    it(`deposits ${label}, confirms LP received and refreshes balances`, () => {
      const { deployer } = testnetConfig
      cy.mount(
        <StellarTestWrapper address={deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={pool} />
        </StellarTestWrapper>,
      )
      checkDepositBalances(state)
      if (isSeed) {
        expect(state.supply).to.equal('0')
        checkDepositDetail('seed-lock', state.config.seedLock)
        cy.get('[data-testid="pool-deposit-seed-alert"]', LOAD_TIMEOUT).should('be.visible')
      } else {
        cy.get('[data-testid="pool-deposit-seed-alert"]').should('not.exist')
        cy.get('[data-testid="pool-deposit-seed-lock"]').should('not.exist')
      }
      const amounts = getAmounts(state.coins)
      writeDepositForm(state.coins, amounts)
      cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(
        ({ expected, minimum, projected }) => {
          checkDepositDetail('expected-lp', expected)
          checkDepositDetail('minimum-lp', minimum)
          checkDepositDetail('projected-lp', projected)
          getActionValue('estimated-tx-cost').should('include', '$')
          submitDepositForm(state)
          checkDepositBalances({
            ...state,
            lp: { ...state.lp, balance: projected },
            coins: state.coins.map(coin => ({ ...coin, balance: decimalMinus(coin.balance, amounts[coin.symbol]) })),
          })
          cy.then(LOAD_TIMEOUT, () => fetchDepositState(pool, testnetConfig)).then(next => {
            state.coins.forEach(({ symbol, balance }) => {
              const received = assert(
                next.coins.find(coin => coin.symbol === symbol),
                `Missing balance for ${symbol}`,
              )
              expect(received.balance).to.equal(decimalMinus(balance, amounts[symbol]))
            })
            expect(next.lp.balance).to.equal(projected)
            expect(
              decimalMinus(next.supply, state.supply),
              'LP supply includes the lock only on the first deposit',
            ).to.equal(decimalSum(expected, isSeed ? state.config.seedLock : '0'))
            expect(decimalMinus(next.supply, next.lp.balance), 'permanently locked LP').to.equal(state.config.seedLock)
            cy.get('[data-testid="pool-deposit-seed-alert"]').should('not.exist')
            cy.get('[data-testid="pool-deposit-seed-lock"]').should('not.exist')
            checkDepositBalances(next)
            state = next
          })
        },
      )
    })
  })
})
