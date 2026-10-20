import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { oneDecimal, oneInt, oneOf } from '@cy/support/generators'
import { checkEstimatedTxCost, getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import {
  allCoinDeposit,
  checkBalancedDepositAmounts,
  checkBalancedWalletAmounts,
  checkDepositBalances,
  checkDepositDetail,
  depositBalancedCheckbox,
  depositSubmit,
  submitDepositAndCheck,
} from '@cy/support/helpers/stellar/deposit.helpers'
import {
  checkPoolInputError,
  checkPoolPriceImpact,
  checkPoolSlippage,
  fetchPoolState,
  poolInput,
  type PoolAmounts,
  type PoolState,
  TEST_NETWORK,
  writePoolAmount,
  writePoolForm,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { decimalMultiply, decimalSum } from '@ui/lib/decimal'

describe('Stellar testnet deposit', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: PoolState

  before(() => {
    getTestnetConfig()
      .then(async config => {
        testnetConfig = config
        await connectTestWallet(config)
      })
      .then(TIMEOUTS['stellar.deployPool'], () => deployTestPool(testnetConfig))
      .then(deployedPool => (pool = deployedPool))
  })

  beforeEach(() =>
    cy.then(TIMEOUTS['stellar.read'], () => fetchPoolState(pool, testnetConfig)).then(fresh => (state = fresh)),
  )

  const mountDeposit = ({ connected = true } = {}) => {
    cy.mount(
      <StellarTestWrapper address={connected ? testnetConfig.deployer.address : undefined}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    if (connected) checkDepositBalances(state)
  }

  it('rejects an empty deposit and amounts exceeding a wallet balance', () => {
    mountDeposit()
    depositSubmit().should('be.disabled')
    const coin = oneOf(...state.coins)
    writePoolAmount(coin.address, '0')
    cy.get('[data-testid="loan-form-error-root"]').should('contain.text', 'Enter an amount to deposit')
    writePoolForm(state.coins, {
      ...allCoinDeposit(state.coins),
      [coin.symbol]: decimalSum(coin.balance, oneDecimal(1, 10)),
    })
    checkPoolInputError(coin.address, 'Insufficient token balance')
    depositSubmit().should('be.disabled')
  })

  it('requires every seed coin and seeds the pool', () => {
    mountDeposit()
    expect(state.supply).to.equal('0')
    const coin = oneOf(...state.coins)
    const amounts = allCoinDeposit(state.coins)
    cy.get('[data-testid="pool-deposit-seed-alert"]').should('be.visible')
    checkDepositDetail('seed-lock', state.config.seedLock)
    depositBalancedCheckbox().should('be.disabled')
    writePoolForm(state.coins, amounts)
    writePoolAmount(coin.address, oneOf('0', undefined))
    cy.get('[data-testid="loan-form-error-root"]').should(
      'contain.text',
      'Seed deposits require a positive amount of every coin',
    )
    depositSubmit().should('be.disabled')
    poolInput(coin.address).find('[data-testid="input-chip-Max"]').click()
    poolInput(coin.address).find('input').should('have.value', coin.balance)
    writePoolAmount(coin.address, amounts[coin.symbol])
    submitDepositAndCheck(state, amounts)
    cy.get('[data-testid="pool-deposit-seed-alert"]').should('not.exist')
  })

  it('previews disconnected amounts', () => {
    mountDeposit({ connected: false })
    const coinIndex = oneInt(state.coins.length)
    const coin = state.coins[coinIndex]
    const unit = oneDecimal(0.0001, 0.001)
    writePoolAmount(coin.address, decimalMultiply(unit, coinIndex + 1))
    getActionValue('pool-deposit-expected-lp', 'stellar.simulation').should(value =>
      expect(Number(value)).to.be.greaterThan(0),
    )
    state.coins.forEach(({ address }) => {
      poolInput(address).find('[data-testid="helper-message-error"]').should('not.exist')
    })
    depositBalancedCheckbox().check()
    checkBalancedDepositAmounts(state.coins, +unit)
    const editedUnit = decimalMultiply(unit, oneInt(2, 5))
    writePoolAmount(coin.address, decimalMultiply(editedUnit, coinIndex + 1))
    checkBalancedDepositAmounts(state.coins, +editedUnit)
    cy.get('[data-testid="pool-deposit-connect-wallet"]').should('be.enabled')
    depositSubmit().should('not.exist')
  })

  it('deposits balanced amounts', () => {
    mountDeposit()
    const coinIndex = oneInt(state.coins.length)
    const coin = state.coins[coinIndex]
    const unit = oneDecimal(0.0001, 0.001)
    const amounts = allCoinDeposit(state.coins, unit)
    const overBalance = decimalSum(coin.balance, oneDecimal(1, 10))
    depositBalancedCheckbox().should('not.be.checked').check()
    checkBalancedWalletAmounts(state.coins)
    writePoolAmount(coin.address, amounts[coin.symbol])
    checkBalancedDepositAmounts(state.coins, +unit)
    writePoolAmount(coin.address, overBalance)
    checkPoolInputError(coin.address, 'Insufficient token balance')
    poolInput(coin.address).find('input').should('have.value', overBalance)
    depositSubmit().should('be.disabled')
    writePoolAmount(coin.address, amounts[coin.symbol])
    checkBalancedDepositAmounts(state.coins, +unit)
    depositBalancedCheckbox().uncheck()
    writePoolAmount(coin.address, oneDecimal(+unit / 4, +unit / 2, coin.decimals))
    state.coins
      .filter(({ address }) => address !== coin.address)
      .forEach(({ address, symbol }) => {
        poolInput(address).find('input').should('have.value', amounts[symbol])
      })
    depositBalancedCheckbox().check()
    checkBalancedWalletAmounts(state.coins)
    poolInput(coin.address).find('[data-testid="input-chip-Max"]').click()
    poolInput(coin.address).find('input').should('have.value', coin.balance)
    checkBalancedDepositAmounts(state.coins, +coin.balance / (coinIndex + 1))
    writePoolAmount(coin.address, amounts[coin.symbol])
    checkBalancedDepositAmounts(state.coins, +unit)
    checkEstimatedTxCost({ category: 'stellar.simulation' })
    checkPoolSlippage()
    checkPoolPriceImpact()
    submitDepositAndCheck(state, amounts)
    depositBalancedCheckbox().should('not.be.checked')
  })

  it('deposits a single coin', () => {
    mountDeposit()
    const coin = oneOf(...state.coins)
    const amounts: PoolAmounts = { [coin.symbol]: oneDecimal(0.001, 0.01, coin.decimals) }
    cy.log(`Deposit ${coin.symbol}`)
    writePoolForm(state.coins, amounts)
    submitDepositAndCheck(state, amounts)
  })
})
