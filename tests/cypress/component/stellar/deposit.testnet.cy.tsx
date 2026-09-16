import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { oneOf } from '@cy/support/generators'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import {
  allCoinDeposit,
  BASE_DEPOSIT_AMOUNT,
  checkBalancedDepositAmounts,
  checkBalancedWalletAmounts,
  checkDepositBalances,
  checkDepositResult,
  checkDepositDetail,
  checkDepositSupply,
  depositBalancedCheckbox,
  depositSubmit,
  fetchDepositPreview,
  submitDepositForm,
} from '@cy/support/helpers/stellar/deposit.helpers'
import {
  TEST_NETWORK,
  fetchPoolState,
  type PoolState,
  type PoolAmounts,
  poolInput,
  writePoolAmount,
  writePoolForm,
  checkPoolInputError,
  checkPoolGasEstimate,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { LOAD_TIMEOUT, skipTestsAfterFailure, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { fromEntries } from '@primitives/objects.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { decimalMultiply, decimalSum, fromWei } from '@ui/lib/decimal'

const singleCoinDeposit = (coins: PoolState['coins']): PoolAmounts =>
  fromEntries([[oneOf(...coins).symbol, BASE_DEPOSIT_AMOUNT]])
const zeroDeposit = (coins: PoolState['coins']): PoolAmounts => fromEntries(coins.map(c => [c.symbol, '0']))

describe('Stellar testnet deposit', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: PoolState

  before(() => {
    queryClient.clear()
    getTestnetConfig()
      .then(config => {
        testnetConfig = config
        return connectTestWallet(config)
      })
      .then(TRANSACTION_LOAD_TIMEOUT, () => deployTestPool(testnetConfig))
      .then(LOAD_TIMEOUT, deployedPool => (pool = deployedPool))
  })

  beforeEach(() => {
    queryClient.clear()
    cy.intercept('GET', 'https://api.testnet.stellarindex.io/v1/price*', { statusCode: 404 })
    cy.then(() => connectTestWallet(testnetConfig))
      .then(LOAD_TIMEOUT, () => fetchPoolState(pool, testnetConfig))
      .then(freshState => (state = freshState))
  })

  const mountDeposit = ({ connected = true } = {}) =>
    cy.mount(
      <StellarTestWrapper address={connected ? testnetConfig.deployer.address : undefined}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )

  it('requires a connected wallet', () => {
    const { coins } = state
    mountDeposit({ connected: false })
    coins.forEach(({ address }) => {
      poolInput(address).should('be.visible')
    })
    cy.get('[data-testid="pool-deposit-connect-wallet"]', LOAD_TIMEOUT).should('be.enabled')
    depositSubmit().should('not.exist')
    cy.get('[data-testid="pool-deposit-balanced-checkbox"]').should('be.visible')
  })

  it('loads pool balances and rejects an empty or zero deposit', () => {
    mountDeposit()
    checkDepositBalances(state)
    depositSubmit().should('be.disabled')
    writePoolForm(state.coins, zeroDeposit(state.coins))
    cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
      .should('be.visible')
      .and('contain.text', 'Enter an amount to deposit')
    depositSubmit().should('be.disabled')
  })

  it('rejects amounts exceeding wallet balances and token precision', () => {
    mountDeposit()
    checkDepositBalances(state)
    state.coins.forEach(({ address, symbol, balance, decimals }) => {
      writePoolForm(state.coins, { ...allCoinDeposit(state.coins), [symbol]: decimalSum(balance, '1') })
      checkPoolInputError(address, 'Insufficient token balance')
      depositSubmit().should('be.disabled')
      writePoolForm(state.coins, { [symbol]: fromWei('1', decimals + 1) })
      checkPoolInputError(address, 'Amount exceeds token decimal precision')
      depositSubmit().should('be.disabled')
    })
  })

  it('fills each coin balance with Max', () => {
    mountDeposit()
    checkDepositBalances(state)
    state.coins.forEach(({ address, balance }) => {
      poolInput(address).find('[data-testid="input-chip-Max"]').click()
      poolInput(address).find('input').should('have.value', balance)
    })
  })

  it('requires every coin in the seed deposit', () => {
    expect(state.supply, 'new pool supply').to.equal('0')
    expect(state.lp.balance, 'new pool LP balance').to.equal('0')
    mountDeposit()
    cy.get('[data-testid="pool-deposit-seed-alert"]', LOAD_TIMEOUT).should('be.visible')
    checkDepositDetail('seed-lock', state.config.seedLock)
    depositBalancedCheckbox().should('be.disabled')
    state.coins.forEach(({ address, symbol }) => {
      writePoolForm(state.coins, { ...allCoinDeposit(state.coins), [symbol]: '0' })
      cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
        .should('be.visible')
        .and('contain.text', 'Seed deposits require a positive amount of every coin')
      depositSubmit().should('be.disabled')
      writePoolAmount(address, undefined)
      cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
        .should('be.visible')
        .and('contain.text', 'Seed deposits require a positive amount of every coin')
      depositSubmit().should('be.disabled')
    })
  })

  it('seeds the pool', () => {
    mountDeposit()
    expect(state.supply).to.equal('0')
    const amounts = allCoinDeposit(state.coins)
    writePoolForm(state.coins, amounts)
    cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(({ expected, minimum, projected }) => {
      checkDepositDetail('expected-lp', expected)
      checkDepositDetail('minimum-lp', minimum)
      checkPoolGasEstimate()
      submitDepositForm(state)
      checkDepositResult(state, amounts, projected)
      checkDepositSupply(pool, state, expected)
      cy.get('[data-testid="pool-deposit-seed-alert"]').should('not.exist')
    })
  })

  it('previews disconnected amounts', () => {
    mountDeposit({ connected: false })
    writePoolAmount(state.coins[0].address, '0.001')
    getActionValue('pool-deposit-expected-lp').should(value => expect(Number(value)).to.be.greaterThan(0))
    state.coins.forEach(({ address }) => {
      poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist')
    })
    depositBalancedCheckbox().should('be.enabled').check()
    checkBalancedDepositAmounts(state.coins, 0.001)
    writePoolAmount(state.coins[1].address, '0.004')
    checkBalancedDepositAmounts(state.coins, 0.002)
    cy.get('[data-testid="pool-deposit-connect-wallet"]').should('be.enabled')
  })

  it('balances wallet amounts initially and preserves subsequent edits', () => {
    mountDeposit()
    checkDepositBalances(state)
    const [first, second, third] = state.coins
    writePoolAmount(first.address, '0.001')
    depositSubmit().should('be.enabled')
    depositBalancedCheckbox().should('be.enabled').check()
    checkBalancedWalletAmounts(state.coins)
    writePoolAmount(second.address, '0.004')
    checkBalancedDepositAmounts(state.coins, 0.002)
    writePoolAmount(second.address, decimalSum(second.balance, '1'))
    checkPoolInputError(second.address, 'Insufficient token balance')
    poolInput(second.address).find('input').should('have.value', decimalSum(second.balance, '1'))
    depositSubmit().should('be.disabled')
    writePoolAmount(second.address, '0.004')
    checkBalancedDepositAmounts(state.coins, 0.002)
    depositBalancedCheckbox().uncheck()
    writePoolAmount(second.address, '0.001')
    poolInput(first.address).find('input').should('have.value', '0.002')
    poolInput(third.address).find('input').should('have.value', '0.006')
    depositBalancedCheckbox().check()
    checkBalancedWalletAmounts(state.coins)
    poolInput(second.address).find('[data-testid="input-chip-Max"]').click()
    poolInput(second.address).find('input').should('have.value', second.balance)
    depositBalancedCheckbox().should('be.checked')
    checkBalancedDepositAmounts(state.coins, +second.balance / 2)
  })

  it('deposits balanced amounts', () => {
    mountDeposit()
    checkDepositBalances(state)
    depositBalancedCheckbox().should('not.be.checked').and('be.enabled').check()
    checkBalancedWalletAmounts(state.coins)
    writePoolAmount(state.coins[0].address, '0.001')
    checkBalancedDepositAmounts(state.coins, 0.001)
    const amounts = fromEntries(state.coins.map((coin, index) => [coin.symbol, decimalMultiply('0.001', index + 1)]))
    cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(({ projected }) => {
      checkPoolGasEstimate()
      submitDepositForm(state)
      checkDepositResult(state, amounts, projected)
      depositBalancedCheckbox().should('not.be.checked')
    })
  })

  ;[
    { label: 'all three coins', amounts: allCoinDeposit },
    { label: 'a single coin', amounts: singleCoinDeposit },
  ].forEach(({ label, amounts: getAmounts }) => {
    it(`deposits ${label}`, () => {
      mountDeposit()
      checkDepositBalances(state)
      const amounts = getAmounts(state.coins)
      writePoolForm(state.coins, amounts)
      cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(
        ({ expected, minimum, projected }) => {
          checkDepositDetail('expected-lp', expected)
          checkDepositDetail('minimum-lp', minimum)
          checkDepositDetail('projected-lp', projected)
          checkPoolGasEstimate()
          submitDepositForm(state)
          checkDepositResult(state, amounts, projected)
          checkDepositSupply(pool, state, expected)
        },
      )
    })
  })
})
