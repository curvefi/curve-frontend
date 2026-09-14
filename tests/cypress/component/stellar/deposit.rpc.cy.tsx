import { once } from 'lodash'
import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { DepositTab } from '@/stellar/features/deposit/DepositTab'
import { connectTestWallet, deployTestPool } from '@cy/support/helpers/stellar/connector'
import {
  checkDepositBalances,
  checkDepositDetail,
  type DepositAmounts,
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
import { assert } from '@primitives/objects.utils'
import { queryClient } from '@ui/features/queries/query-client'
import { decimalMinus, decimalSum, fromWei } from '@ui/lib/decimal'

const balancedDeposit: DepositAmounts = { USDX: '0.01', USDY: '0.01', USDZ: '0.01' }
const zeroDeposit: DepositAmounts = { USDX: '0', USDY: '0', USDZ: '0' }

describe('Stellar testnet deposit', () => {
  skipTestsAfterFailure()

  let testnetConfig: TestnetConfig
  const getPool = once(deployTestPool)
  const getDepositState = () =>
    cy.get<StellarAddress>('@pool').then(LOAD_TIMEOUT, pool => fetchDepositState(pool, testnetConfig))

  before(() => {
    getTestnetConfig().then(config => {
      testnetConfig = config
    })
  })

  beforeEach(() => {
    queryClient.clear()
    cy.then(() => connectTestWallet(testnetConfig))
      .then(TRANSACTION_LOAD_TIMEOUT, () => getPool(testnetConfig))
      .as('pool', { type: 'static' })
  })

  it('requires a connected wallet', () => {
    const { coins } = testnetConfig
    cy.get<StellarAddress>('@pool').then(pool => {
      cy.mount(
        <StellarTestWrapper>
          <DepositTab network={TEST_NETWORK} pool={pool} />
        </StellarTestWrapper>,
      )
    })
    coins.forEach(({ symbol }) => {
      depositInput(symbol).should('be.visible')
    })
    cy.contains('button', 'Connect Wallet', LOAD_TIMEOUT).should('be.enabled')
    depositSubmit().should('not.exist')
  })

  it('loads pool balances and rejects an empty or zero deposit', () => {
    getDepositState().then(state => {
      const { deployer } = testnetConfig
      cy.mount(
        <StellarTestWrapper address={deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={state.pool} />
        </StellarTestWrapper>,
      )
      checkDepositBalances(state)
      depositSubmit().should('be.disabled')
      writeDepositForm(zeroDeposit)
      cy.contains('Enter an amount to deposit', LOAD_TIMEOUT).should('be.visible')
      depositSubmit().should('be.disabled')
    })
  })

  it('rejects amounts exceeding wallet balances and token precision', () => {
    getDepositState().then(state => {
      const { deployer } = testnetConfig
      cy.mount(
        <StellarTestWrapper address={deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={state.pool} />
        </StellarTestWrapper>,
      )
      checkDepositBalances(state)
      state.coins.forEach(({ symbol, balance, decimals }) => {
        writeDepositForm({ ...balancedDeposit, [symbol]: decimalSum(balance, '1') })
        cy.contains('Insufficient token balance', LOAD_TIMEOUT).should('be.visible')
        depositSubmit().should('be.disabled')
        writeDepositForm({ [symbol]: fromWei('1', decimals + 1) })
        cy.contains('Amounts exceed token decimal precision', LOAD_TIMEOUT).should('be.visible')
        depositSubmit().should('be.disabled')
      })
    })
  })

  it('fills each coin balance with Max', () => {
    getDepositState().then(state => {
      const { deployer } = testnetConfig
      cy.mount(
        <StellarTestWrapper address={deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={state.pool} />
        </StellarTestWrapper>,
      )
      checkDepositBalances(state)
      state.coins.forEach(({ symbol, balance }) => {
        depositInput(symbol).contains('Max').click()
        depositInput(symbol).find('input').should('have.value', balance)
      })
    })
  })

  it('requires every coin in the seed deposit', () => {
    getDepositState().then(state => {
      const { deployer } = testnetConfig
      expect(state.supply, 'new pool supply').to.equal('0')
      expect(state.lp.balance, 'new pool LP balance').to.equal('0')
      cy.mount(
        <StellarTestWrapper address={deployer.address}>
          <DepositTab network={TEST_NETWORK} pool={state.pool} />
        </StellarTestWrapper>,
      )
      cy.contains('The first deposit must fund every coin', LOAD_TIMEOUT).should('be.visible')
      checkDepositDetail('Permanently locked LP', state.config.seedLock)
      state.coins.forEach(({ symbol }) => {
        writeDepositForm({ ...balancedDeposit, [symbol]: '0' })
        cy.contains('Seed deposits require a positive amount of every coin', LOAD_TIMEOUT).should('be.visible')
        depositSubmit().should('be.disabled')
        depositInput(symbol).find('input').clear().blur()
        cy.contains('Seed deposits require a positive amount of every coin', LOAD_TIMEOUT).should('be.visible')
        depositSubmit().should('be.disabled')
      })
    })
  })

  ;[
    { label: 'the initial seed', amounts: balancedDeposit, isSeed: true },
    { label: 'all three coins', amounts: balancedDeposit, isSeed: false },
    { label: 'a single coin', amounts: { USDX: '0.01' } satisfies DepositAmounts, isSeed: false },
  ].forEach(({ label, amounts, isSeed }) => {
    it(`deposits ${label}, confirms LP received and refreshes balances`, () => {
      getDepositState().then(state => {
        const { deployer } = testnetConfig
        cy.mount(
          <StellarTestWrapper address={deployer.address}>
            <DepositTab network={TEST_NETWORK} pool={state.pool} />
          </StellarTestWrapper>,
        )
        checkDepositBalances(state)
        if (isSeed) {
          expect(state.supply).to.equal('0')
          checkDepositDetail('Permanently locked LP', state.config.seedLock)
          cy.contains('The first deposit must fund every coin', LOAD_TIMEOUT).should('be.visible')
        } else {
          cy.contains('The first deposit must fund every coin').should('not.exist')
          cy.contains('Permanently locked LP').should('not.exist')
        }
        writeDepositForm(amounts)
        cy.then(LOAD_TIMEOUT, () => fetchDepositPreview(state, amounts)).then(({ expected, minimum, projected }) => {
          checkDepositDetail('Expected LP received', expected)
          checkDepositDetail('Minimum LP received', minimum)
          checkDepositDetail('Projected LP balance', projected)
          cy.get('[data-testid="estimated-tx-cost-value"]', LOAD_TIMEOUT).should('contain.text', 'XLM')
          submitDepositForm(state)
          checkDepositBalances({
            ...state,
            lp: { ...state.lp, balance: projected },
            coins: state.coins.map(coin => ({ ...coin, balance: decimalMinus(coin.balance, amounts[coin.symbol]) })),
          })
          getDepositState().then(next => {
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
            cy.contains('The first deposit must fund every coin').should('not.exist')
            cy.contains('Permanently locked LP').should('not.exist')
            checkDepositBalances(next)
          })
        })
      })
    })
  })
})
