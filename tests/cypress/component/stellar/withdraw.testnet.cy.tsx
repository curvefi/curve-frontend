import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { AdvancedWithdrawTab } from '@/stellar/features/withdraw/AdvancedWithdrawTab'
import { OneCoinWithdrawTab } from '@/stellar/features/withdraw/OneCoinWithdrawTab'
import { oneDecimal, oneOf } from '@cy/support/generators'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import {
  checkPoolInputError,
  poolInput,
  readPoolAmounts,
  TEST_NETWORK,
  writePoolAmount,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import {
  checkPartialWithdrawQuote,
  checkWithdrawBalances,
  checkWithdrawDetail,
  fetchWithdrawState,
  seedPoolAndTransferMostLpToIssuer,
  selectWithdrawMax,
  submitWithdrawAndCheck,
  withdrawLpInput,
  type WithdrawState,
  withdrawSubmit,
  writeWithdrawLp,
} from '@cy/support/helpers/stellar/withdraw.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { decimalMinus, decimalSum } from '@ui/lib/decimal'

describe('Stellar testnet withdraw', () => {
  skipTestsAfterFailure()
  let config: TestnetConfig
  let pool: StellarContract
  let state: WithdrawState
  const refreshState = () =>
    cy.then(TIMEOUTS['stellar.read'], () => fetchWithdrawState(pool, config)).then(fresh => (state = fresh))
  const mountWithdraw = ({ advanced = false, connected = true } = {}) => {
    const Tab = advanced ? AdvancedWithdrawTab : OneCoinWithdrawTab
    cy.mount(
      <StellarTestWrapper address={connected ? config.deployer.address : undefined}>
        <Tab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
  }
  before(() => {
    getTestnetConfig()
      .then(async value => {
        config = value
        await connectTestWallet(value)
      })
      .then(TIMEOUTS['stellar.deployPool'], () => deployTestPool(config))
      .then(deployed => (pool = deployed))
      .then(refreshState)
  })

  it('disables unseeded withdrawals and requires a wallet', () => {
    mountWithdraw()
    withdrawSubmit().should('be.disabled')
    cy.get('[data-testid^="pool-token-input-"] input:visible').should('be.disabled')
    mountWithdraw({ connected: false })
    cy.get('[data-testid="pool-withdraw-connect-wallet"]').should('be.enabled')
  })

  describe('Advanced', () => {
    before(() =>
      cy
        .then(TIMEOUTS['stellar.deployPool'], () => deployTestPool(config))
        .then(deployed => (pool = deployed))
        .then(TIMEOUTS['stellar.seedPool'], () => seedPoolAndTransferMostLpToIssuer(pool, config)),
    )
    beforeEach(refreshState)

    it('validates and synchronizes balanced amounts, then withdraws independently of slippage', () => {
      mountWithdraw({ advanced: true })
      withdrawLpInput().should('be.visible')
      cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').should('not.be.checked')
      checkWithdrawBalances(state)
      for (const [amount, message] of [
        ['0', 'Enter an LP amount'],
        [decimalSum(state.lp.balance, '1'), 'Insufficient LP balance'],
      ] as const) {
        writeWithdrawLp(amount)
        withdrawLpInput().find('[data-testid="helper-message-error"]').should('contain.text', message)
        withdrawSubmit().should('be.disabled')
      }
      const amount = oneDecimal(+state.lp.balance * 0.1, +state.lp.balance * 0.2, state.lp.decimals)
      writeWithdrawLp(amount)
      withdrawLpInput().find('[data-testid="helper-message-error"]').should('not.exist')
      readPoolAmounts(state.coins).then(amounts => {
        cy.get('[data-testid="slippage-settings-button"]').click()
        cy.get('[data-testid="slippage-input"] input').clear().type('1')
        cy.get('[data-testid="slippage-save-button"]').click()
        state.coins.map(({ address }, index) => poolInput(address).find('input').should('have.value', amounts[index]))
      })
      withdrawLpInput().find('input').should('have.value', amount)
      checkWithdrawDetail('projected-lp', decimalMinus(state.lp.balance, amount))
      state.coins.map(({ address, decimals }, i) =>
        poolInput(address)
          .find('input')
          .should(input =>
            expect(+input.val()!).to.be.closeTo((+state.reserves[i] * +amount) / +state.supply, 10 ** -decimals),
          ),
      )
      const coin = oneOf(...state.coins)
      const i = state.coins.indexOf(coin)
      const output = oneDecimal(
        ((+state.reserves[i] * +amount) / +state.supply) * 0.4,
        ((+state.reserves[i] * +amount) / +state.supply) * 0.6,
        coin.decimals,
      )
      writePoolAmount(coin.address, output)
      cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').should('not.be.checked')
      withdrawLpInput()
        .find('input')
        .should(input => expect(+input.val()!).to.be.lessThan(+amount))
      submitWithdrawAndCheck(state)
    })

    it('switches to independent outputs, rejects excessive amounts and withdraws corrected amounts', () => {
      mountWithdraw({ advanced: true })
      withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
      checkWithdrawDetail('projected-lp', '0')
      readPoolAmounts(state.coins).then(amounts => {
        cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').check(TIMEOUTS['stellar.read'])
        cy.get('[data-testid="pool-withdraw-lp-input"]').should('not.exist')
        const amount = oneDecimal(+amounts[0] * 0.1, +amounts[0] * 0.2, state.coins[0].decimals)
        writePoolAmount(state.coins[0].address, amount)
        state.coins.map(({ address }, i) =>
          poolInput(address)
            .find('input')
            .should('have.value', i === 0 ? amount : amounts[i]),
        )
        withdrawSubmit().should('be.enabled')
      })
      const coin = oneOf(...state.coins)
      writePoolAmount(coin.address, decimalSum(state.reserves[state.coins.indexOf(coin)], '1'))
      checkPoolInputError(coin.address, 'Amount exceeds the maximum withdrawal')
      withdrawSubmit().should('be.disabled')
      writePoolAmount(coin.address, oneDecimal(+state.lp.balance * 0.01, +state.lp.balance * 0.02, coin.decimals))
      cy.get('[data-testid="pool-withdraw-lp-input"]').should('not.exist')
      submitWithdrawAndCheck(state)
    })
  })

  describe('One coin', () => {
    beforeEach(refreshState)

    it('resets on token changes, rejects invalid amounts and withdraws corrected manual amounts', () => {
      mountWithdraw()
      selectWithdrawMax(state, state.coins[0])
      cy.get('[data-testid="withdraw-token-select"]').click()
      cy.get(`[data-testid="token-option-${state.coins[1].address.toLowerCase()}"]`).click()
      poolInput(state.coins[1].address).find('input').should('have.value', '')
      poolInput(state.coins[0].address).should('not.exist')
      withdrawSubmit().should('be.disabled')
      const coin = state.coins[1]
      writePoolAmount(coin.address, '0')
      withdrawSubmit().should('be.disabled')
      writePoolAmount(coin.address, decimalSum(state.reserves[1], '1'))
      checkPoolInputError(coin.address, 'Amount exceeds the maximum withdrawal')
      withdrawSubmit().should('be.disabled')
      writePoolAmount(coin.address, oneDecimal(+state.lp.balance * 0.01, +state.lp.balance * 0.02, coin.decimals))
      checkPartialWithdrawQuote(state, state.lp.balance)
      poolInput(coin.address).find('[data-testid="helper-message-error"]').should('not.exist')
      submitWithdrawAndCheck(state)
    })

    // Reuse liquidity across tests; the full withdrawal must remain last.
    it('returns from Max to manual amounts, then withdraws Max without LP dust', () => {
      mountWithdraw()
      const coin = oneOf(...state.coins)
      selectWithdrawMax(state, coin)
      writePoolAmount(coin.address, oneDecimal(+state.lp.balance * 0.01, +state.lp.balance * 0.02, coin.decimals))
      checkPartialWithdrawQuote(state, state.lp.balance)
      selectWithdrawMax(state, coin)
      submitWithdrawAndCheck(state)
      mountWithdraw({ advanced: true })
      cy.get('[data-testid="withdraw-unbalanced-checkbox"] input').should('not.be.checked')
      withdrawLpInput().find('[data-testid="balance-value"]').should('have.attr', 'data-value', '0')
    })
  })
})
