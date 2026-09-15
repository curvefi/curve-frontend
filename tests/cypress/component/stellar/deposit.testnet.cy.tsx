import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { oneOf } from '@cy/support/generators'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import {
  checkBalancedDepositAmounts,
  checkBalancedWalletAmounts,
  checkDepositBalances,
  checkDepositDetail,
  checkDepositGasEstimate,
  checkDepositSupply,
  type DepositAmounts,
  depositBalancedCheckbox,
  depositInput,
  type DepositState,
  depositSubmit,
  fetchDepositPreview,
  fetchDepositState,
  submitDepositForm,
  TEST_NETWORK,
  writeDepositAmount,
  writeDepositForm,
} from '@cy/support/helpers/stellar/deposit.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { LOAD_TIMEOUT, skipTestsAfterFailure, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import { fromEntries } from '@primitives/objects.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { decimalMinus, decimalMultiply, decimalSum, fromWei } from '@ui/lib/decimal'

const allCoinDeposit = (coins: DepositState['coins']): DepositAmounts =>
  fromEntries(coins.map((c, index) => [c.symbol, decimalMultiply('0.01', `${index + 1}`)]))
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
      .then(LOAD_TIMEOUT, deployedPool => (pool = deployedPool))
  })

  beforeEach(() => {
    queryClient.clear()
    cy.intercept('GET', 'https://api.testnet.stellarindex.io/v1/price*', { statusCode: 404 })
    cy.then(() => connectTestWallet(testnetConfig))
      .then(LOAD_TIMEOUT, () => fetchDepositState(pool, testnetConfig))
      .then(freshState => (state = freshState))
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
    cy.get('[data-testid="pool-deposit-balanced-checkbox"]').should('be.visible')
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
      writeDepositForm(state.coins, { ...allCoinDeposit(state.coins), [symbol]: decimalSum(balance, '1') })
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
    depositBalancedCheckbox().should('be.disabled')
    state.coins.forEach(({ address, symbol }) => {
      writeDepositForm(state.coins, { ...allCoinDeposit(state.coins), [symbol]: '0' })
      cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
        .should('be.visible')
        .and('contain.text', 'Seed deposits require a positive amount of every coin')
      depositSubmit().should('be.disabled')
      writeDepositAmount(address, undefined)
      cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT)
        .should('be.visible')
        .and('contain.text', 'Seed deposits require a positive amount of every coin')
      depositSubmit().should('be.disabled')
    })
  })

  it('seeds the pool', () => {
    cy.mount(
      <StellarTestWrapper address={testnetConfig.deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    expect(state.supply).to.equal('0')
    const amounts = allCoinDeposit(state.coins)
    writeDepositForm(state.coins, amounts)
    cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(({ expected, minimum, projected }) => {
      checkDepositDetail('expected-lp', expected)
      checkDepositDetail('minimum-lp', minimum)
      checkDepositGasEstimate()
      submitDepositForm(state)
      checkDepositBalances({
        ...state,
        lp: { ...state.lp, balance: projected },
        coins: state.coins.map(coin => ({ ...coin, balance: decimalMinus(coin.balance, amounts[coin.symbol]) })),
      })
      checkDepositSupply(pool, state, expected)
      cy.get('[data-testid="pool-deposit-seed-alert"]').should('not.exist')
    })
  })

  it('balances entered amounts', () => {
    cy.mount(
      <StellarTestWrapper>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    const [first, second, third] = state.coins
    writeDepositAmount(first.address, '0.001')
    depositBalancedCheckbox().should('be.enabled').check()
    checkBalancedDepositAmounts(state.coins, 0.001)
    writeDepositAmount(second.address, '0.004')
    checkBalancedDepositAmounts(state.coins, 0.002)
    depositBalancedCheckbox().uncheck()
    writeDepositAmount(second.address, '0.001')
    depositInput(first.address).find('input').should('have.value', '0.002')
    depositInput(third.address).find('input').should('have.value', '0.006')
    cy.get('[data-testid="pool-deposit-connect-wallet"]').should('be.enabled')
  })

  it('deposits balanced amounts', () => {
    cy.mount(
      <StellarTestWrapper address={testnetConfig.deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    checkDepositBalances(state)
    depositBalancedCheckbox().should('not.be.checked').and('be.enabled').check()
    checkBalancedWalletAmounts(state.coins)
    writeDepositAmount(state.coins[0].address, '0.001')
    checkBalancedDepositAmounts(state.coins, 0.001)
    const amounts = fromEntries(state.coins.map((coin, index) => [coin.symbol, decimalMultiply('0.001', index + 1)]))
    cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(({ projected }) => {
      checkDepositGasEstimate()
      submitDepositForm(state)
      checkDepositBalances({
        ...state,
        lp: { ...state.lp, balance: projected },
        coins: state.coins.map(coin => ({ ...coin, balance: decimalMinus(coin.balance, amounts[coin.symbol]) })),
      })
      depositBalancedCheckbox().should('not.be.checked')
    })
  })

  ;[
    { label: 'all three coins', amounts: allCoinDeposit },
    { label: 'a single coin', amounts: singleCoinDeposit },
  ].forEach(({ label, amounts: getAmounts }) => {
    it(`deposits ${label}`, () => {
      cy.mount(
        <StellarTestWrapper address={testnetConfig.deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={pool} />
        </StellarTestWrapper>,
      )
      checkDepositBalances(state)
      const amounts = getAmounts(state.coins)
      writeDepositForm(state.coins, amounts)
      cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(pool, state, amounts)).then(
        ({ expected, minimum, projected }) => {
          checkDepositDetail('expected-lp', expected)
          checkDepositDetail('minimum-lp', minimum)
          checkDepositDetail('projected-lp', projected)
          checkDepositGasEstimate()
          submitDepositForm(state)
          checkDepositBalances({
            ...state,
            lp: { ...state.lp, balance: projected },
            coins: state.coins.map(coin => ({ ...coin, balance: decimalMinus(coin.balance, amounts[coin.symbol]) })),
          })
          checkDepositSupply(pool, state, expected)
        },
      )
    })
  })
})
