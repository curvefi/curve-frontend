import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { WithdrawTab } from '@/stellar/features/withdraw/WithdrawTab'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import { submitDepositForm } from '@cy/support/helpers/stellar/deposit.helpers'
import {
  checkPoolGasEstimate,
  readPoolAmounts,
  fetchPoolState,
  poolInput,
  TEST_NETWORK,
  writePoolAmount,
  writePoolForm,
  checkPoolInputError,
} from '@cy/support/helpers/stellar/pool.helpers'
import { getTestnetConfig, type TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { StellarTestWrapper } from '@cy/support/helpers/stellar/StellarTestWrapper'
import {
  checkWithdrawBalances,
  checkWithdrawDetail,
  fetchWithdrawPreview,
  fetchWithdrawState,
  submitWithdrawForm,
  withdrawLpInput,
  withdrawSubmit,
  type WithdrawState,
  writeWithdrawLp,
} from '@cy/support/helpers/stellar/withdraw.helpers'
import { LOAD_TIMEOUT, skipTestsAfterFailure, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalMinus, decimalMultiply, decimalSum, fromWei } from '@ui/lib/decimal'

describe('Stellar testnet withdraw', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  let pool: StellarContract
  let state: WithdrawState

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
      .then(LOAD_TIMEOUT, () => fetchWithdrawState(pool, testnetConfig))
      .then(freshState => (state = freshState))
  })

  const mountWithdraw = () => {
    cy.mount(
      <StellarTestWrapper address={testnetConfig.deployer.address}>
        <WithdrawTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    checkWithdrawBalances(state)
  }

  it('disables withdrawals from an unseeded pool', () => {
    expect(state.supply).to.equal('0')
    mountWithdraw()
    withdrawLpInput().find('input').should('be.disabled')
    withdrawSubmit().should('be.disabled')
  })

  it('seeds its own pool through the deposit form', () => {
    cy.mount(
      <StellarTestWrapper address={testnetConfig.deployer.address}>
        <DepositTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    writePoolForm(
      state.coins,
      fromEntries(state.coins.map((coin, index) => [coin.symbol, decimalMultiply('0.01', index + 1)])),
    )
    submitDepositForm(state)
    cy.then(LOAD_TIMEOUT, () => fetchPoolState(pool, testnetConfig)).then(fresh => {
      expect(+fresh.lp.balance).to.be.greaterThan(0)
    })
  })

  it('requires a connected wallet', () => {
    cy.mount(
      <StellarTestWrapper>
        <WithdrawTab network={TEST_NETWORK} pool={pool} />
      </StellarTestWrapper>,
    )
    state.coins.forEach(({ address }) => {
      poolInput(address).should('be.visible')
    })
    cy.get('[data-testid="pool-withdraw-connect-wallet"]', LOAD_TIMEOUT).should('be.enabled')
    withdrawSubmit().should('not.exist')
  })

  it('rejects empty, zero, excessive and overprecision LP amounts', () => {
    mountWithdraw()
    withdrawSubmit().should('be.disabled')
    ;[
      { amount: '0' as Decimal, message: 'Enter an LP amount' },
      { amount: decimalSum(state.lp.balance, '1'), message: 'Insufficient LP balance' },
      { amount: fromWei('1', LP_TOKEN_DECIMALS + 1), message: 'Amount exceeds token decimal precision' },
    ].forEach(({ amount, message }) => {
      writeWithdrawLp(amount)
      withdrawLpInput().find('[data-testid="helper-message-error"]').should('contain.text', message)
      withdrawSubmit().should('be.disabled')
    })
  })

  it('fills balanced outputs with LP Max and preserves edits until the next LP change', () => {
    mountWithdraw()
    withdrawLpInput().find('[data-testid="input-chip-Max"]').click()
    withdrawLpInput().find('input').should('have.value', state.lp.balance)
    const slippage = +useUserProfileStore.getState().maxSlippage.stable
    state.coins.forEach(({ address, decimals }, index) => {
      poolInput(address)
        .find('input')
        .should(input => {
          const expected = (+state.reserves[index] * +state.lp.balance) / +state.supply / (1 + slippage / 100)
          expect(+input.val()!).to.be.closeTo(expected, 10 ** -decimals)
        })
    })
    writePoolAmount(state.coins[0].address, '0.0001')
    withdrawLpInput().find('input').should('have.value', state.lp.balance)
    withdrawSubmit().should('be.enabled')
    poolInput(state.coins[0].address).find('input').should('have.value', '0.0001')
    writeWithdrawLp('0.003')
    poolInput(state.coins[0].address).find('input').should('not.have.value', '0.0001')
  })

  it('rejects zero outputs, reserve overflow, token precision and outputs above the LP budget', () => {
    mountWithdraw()
    writeWithdrawLp('0.001')
    state.coins.forEach(({ address }) => writePoolAmount(address, '0'))
    withdrawSubmit().should('be.disabled')
    state.coins.forEach(({ address, decimals }, index) => {
      writePoolAmount(address, decimalSum(state.reserves[index], '1'))
      checkPoolInputError(address, 'Amount must be less than the available pool reserve')
      withdrawSubmit().should('be.disabled')
      writePoolAmount(address, fromWei('1', decimals + 1))
      checkPoolInputError(address, 'Amount exceeds token decimal precision')
      withdrawSubmit().should('be.disabled')
      writePoolAmount(address, '0')
    })
    writePoolAmount(state.coins[0].address, '0.003')
    cy.get('[data-testid="loan-form-error-root"]', LOAD_TIMEOUT).should(
      'contain.text',
      'Maximum LP required exceeds the LP amount',
    )
    withdrawSubmit().should('be.disabled')
    poolInput(state.coins[0].address).find('input').should('have.value', '0.003')
  })

  ;['balanced outputs', 'a single coin'].forEach(mode => {
    it(`withdraws ${mode} and refreshes balances and supply`, () => {
      mountWithdraw()
      writeWithdrawLp('0.003')
      if (mode === 'a single coin') {
        state.coins.forEach(({ address }, index) => writePoolAmount(address, index === 0 ? '0.0001' : '0'))
      }
      withdrawSubmit().should('be.enabled')
      readPoolAmounts(state.coins).then(amounts =>
        cy
          .then(LOAD_TIMEOUT, () => fetchWithdrawPreview(pool, state, amounts))
          .then(({ expected, maximum, projected }) => {
            checkWithdrawDetail('expected-lp', expected)
            checkWithdrawDetail('maximum-lp', maximum)
            checkWithdrawDetail('projected-lp', projected)
            expect(+maximum).to.be.at.most(0.003)
            checkPoolGasEstimate()
            submitWithdrawForm(state)
            checkWithdrawDetail('current-lp', projected)
            cy.then(LOAD_TIMEOUT, () => fetchWithdrawState(pool, testnetConfig)).then(fresh => {
              checkWithdrawBalances(fresh)
              // Imbalanced withdrawals can also deduct fees from available reserves.
              fresh.reserves.forEach((reserve, index) => {
                expect(+reserve, `${state.coins[index].symbol} pool reserve`).to.be.at.most(
                  +decimalMinus(state.reserves[index], amounts[index]),
                )
              })
              expect(fresh.lp.balance).to.equal(projected)
              expect(fresh.supply).to.equal(decimalMinus(state.supply, expected))
              expect(decimalMinus(fresh.supply, fresh.lp.balance)).to.equal(state.config.seedLock)
              fresh.coins.forEach((coin, index) => {
                expect(coin.balance, `${coin.symbol} wallet balance`).to.equal(
                  decimalSum(state.coins[index].balance, amounts[index]),
                )
              })
            })
          }),
      )
    })
  })
})
