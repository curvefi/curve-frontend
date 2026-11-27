import { disconnect, getConnection } from 'wagmi/actions'
import { SwapTab } from '@/dex/features/swap/components/SwapTab'
import { TEST_SLIPPAGE } from '@cy/support/helpers/dex/curve.helpers'
import { MockPoolTestWrapper } from '@cy/support/helpers/dex/MockPoolTestWrapper'
import { createSwapScenario, SWAP_TEST } from '@cy/support/helpers/dex/mocks/swap.mocks'
import {
  checkPoolSwapDetails,
  poolSwapAmount,
  poolSwapInput,
  poolSwapSubmit,
  selectPoolSwapCoin,
  submitPoolSwap,
  writePoolSwapAmount,
} from '@cy/support/helpers/dex/swap.helpers'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { setupMockedComponentTest } from '@cy/support/helpers/llamalend/test-context.helpers'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { checkNoValidationErrors } from '@cy/support/ui'
import type { Address } from '@primitives/address.utils'
import { constQ } from '@ui/features/queries/util'
import { formatToken } from '@ui/lib/tokens'

const mountSwap = ({ curve, pool }: ReturnType<typeof createSwapScenario>) => {
  if (!curve.signerAddress) cy.then(() => disconnect(mockedWagmiConfig))
  return cy.mount(
    <MockPoolTestWrapper curve={curve} pool={pool}>
      <SwapTab
        maxSlippage={TEST_SLIPPAGE}
        poolAlert={null}
        seed={constQ(false)}
        params={{ network: 'ethereum', poolAddress: pool.address as Address }}
      />
    </MockPoolTestWrapper>,
  )
}

describe('Pool Swap (mocked)', () => {
  beforeEach(setupMockedComponentTest)

  ;[false, true].forEach(wrapped => {
    ;[false, true].forEach(approved => {
      it(`swaps ${wrapped ? 'wrapped' : 'underlying'} tokens ${approved ? 'with an existing approval' : 'after approval'}`, () => {
        const scenario = createSwapScenario({ wrapped, approved })
        const { coins, wrappedCoins, assertPreSubmit, assertSubmit } = scenario
        mountSwap(scenario)
        if (wrapped) {
          writePoolSwapAmount('pay', SWAP_TEST.input)
          cy.get('[data-testid="pool-swap-wrapped-checkbox"] input').check()
          poolSwapAmount('pay').should('have.value', '')
          poolSwapAmount('receive').should('have.value', '')
        } else cy.get('[data-testid="pool-swap-wrapped-checkbox"]').should('not.exist')
        poolSwapSubmit().should('be.disabled')
        writePoolSwapAmount('pay', SWAP_TEST.input)
        poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.output)
        poolSwapSubmit().should('be.enabled')
        const tokens = wrapped ? wrappedCoins : coins
        checkPoolSwapDetails(tokens[0].symbol, tokens[1].symbol, true)
        getActionValue('pool-minimum-received', 'mock.simulation').should(
          'equal',
          formatToken(SWAP_TEST.minimumReceived, tokens[1].symbol, 'balance'),
        )
        cy.then(() => assertPreSubmit({ isWrapped: wrapped }))
        submitPoolSwap(true).then(() => assertSubmit({ isWrapped: wrapped }))
      })
    })
  })

  it('quotes the required pay amount, verifies its output and submits a receive-side amount', () => {
    const scenario = createSwapScenario({ approved: false })
    const { methods, assertPreSubmit, assertSubmit } = scenario
    mountSwap(scenario)
    writePoolSwapAmount('receive', SWAP_TEST.output)
    poolSwapAmount('pay').should('have.attr', 'data-value', SWAP_TEST.input)
    poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.output)
    poolSwapSubmit().should('be.enabled')
    cy.then(() => {
      expect(methods[0].required).to.have.been.calledWithExactly(0, 1, SWAP_TEST.output)
      assertPreSubmit()
    })
    submitPoolSwap(true).then(() => assertSubmit())
  })

  ;(['pay', 'receive'] as const).forEach(side => {
    it(`preserves the ${side} amount and blocks submission while its quote loads`, () => {
      const scenario = createSwapScenario({ delayQuote: true })
      const { methods, releaseQuote } = scenario
      mountSwap(scenario)
      const amount = side === 'pay' ? SWAP_TEST.input : SWAP_TEST.output
      writePoolSwapAmount(side, amount)
      cy.wrap(null).should(() => expect(methods[0][side === 'pay' ? 'expected' : 'required']).to.have.been.called)
      poolSwapAmount(side).should('have.attr', 'data-value', amount)
      poolSwapSubmit().should('be.disabled')
      cy.then(() => expect(methods[0].swap.callCount).to.equal(0))
      cy.then(releaseQuote)
      poolSwapSubmit().should('be.enabled')
      checkNoValidationErrors()
      submitPoolSwap(true).then(() => scenario.assertSubmit())
    })
  })

  it('validates amounts, token precision and wallet balance, then accepts a correction', () => {
    const scenario = createSwapScenario()
    mountSwap(scenario)
    ;(
      [
        ['0', 'Enter an amount to swap'],
        [SWAP_TEST.precisionOverflow, 'Amount exceeds token decimal precision'],
        [SWAP_TEST.excessiveBalance, 'Insufficient token balance'],
      ] as const
    ).forEach(([amount, message]) => {
      writePoolSwapAmount('pay', amount)
      poolSwapInput('pay').find('[data-testid="helper-message-error"]').should('contain.text', message)
      poolSwapSubmit().should('be.disabled')
    })
    writePoolSwapAmount('pay', SWAP_TEST.input)
    poolSwapSubmit().should('be.enabled')
    checkNoValidationErrors()
    submitPoolSwap(true).then(() => scenario.assertSubmit())
  })

  it('validates receive precision and pool reserves, then updates the required input', () => {
    const scenario = createSwapScenario()
    mountSwap(scenario)
    selectPoolSwapCoin('receive', scenario.coins[2].address)
    ;(
      [
        [SWAP_TEST.precisionOverflow, 'Amount exceeds token decimal precision'],
        [SWAP_TEST.reserve, 'Amount must be less than the available pool reserve'],
        [SWAP_TEST.excessiveReserve, 'Amount must be less than the available pool reserve'],
      ] as const
    ).forEach(([amount, message]) => {
      writePoolSwapAmount('receive', amount)
      poolSwapInput('receive').find('[data-testid="helper-message-error"]').should('contain.text', message)
      poolSwapSubmit().should('be.disabled')
    })
    writePoolSwapAmount('receive', SWAP_TEST.output)
    poolSwapAmount('pay').should('have.attr', 'data-value', SWAP_TEST.input)
    poolSwapSubmit().should('be.enabled')
    checkNoValidationErrors()
    submitPoolSwap(true).then(() => scenario.assertSubmit({ to: 2 }))
  })

  it('reverses tokens, swaps sides when selecting the opposite token, and requotes a new token', () => {
    const scenario = createSwapScenario()
    const { coins, assertSubmit } = scenario
    mountSwap(scenario)
    writePoolSwapAmount('pay', SWAP_TEST.input)
    poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.output)
    cy.get('[data-testid="pool-swap-reverse"]').click()
    poolSwapInput('pay').find('[role="combobox"]').should('contain.text', coins[1].symbol)
    poolSwapInput('receive').find('[role="combobox"]').should('contain.text', coins[0].symbol)
    poolSwapAmount('pay').should('have.attr', 'data-value', SWAP_TEST.output)
    poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.input)
    selectPoolSwapCoin('pay', coins[0].address)
    poolSwapAmount('pay').should('have.attr', 'data-value', SWAP_TEST.input)
    poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.output)
    selectPoolSwapCoin('receive', coins[2].address)
    poolSwapInput('receive').find('[role="combobox"]').should('contain.text', coins[2].symbol)
    poolSwapSubmit().should('be.enabled')
    submitPoolSwap(true).then(() => assertSubmit({ to: 2 }))
  })

  it('uses the full ERC20 balance for Max and returns to manual input', () => {
    const scenario = createSwapScenario()
    mountSwap(scenario)
    poolSwapInput('pay').find('[data-testid="input-chip-Max"]').click()
    poolSwapAmount('pay').should('have.attr', 'data-value', SWAP_TEST.balance)
    poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.maxOutput)
    poolSwapSubmit().should('be.enabled')
    writePoolSwapAmount('pay', SWAP_TEST.input)
    poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.output)
    submitPoolSwap(true).then(() => scenario.assertSubmit())
  })

  it('reserves gas when using native-token Max and submits without approval', () => {
    const scenario = createSwapScenario({ native: true, approved: false })
    mountSwap(scenario)
    cy.wrap(null).should(() =>
      expect(scenario.methods[0].estimateGas).to.have.been.calledWithExactly(0, 1, SWAP_TEST.balance, +TEST_SLIPPAGE),
    )
    poolSwapInput('pay').find('[data-testid="input-chip-Max"]').click()
    poolSwapAmount('pay')
      .invoke('attr', 'data-value')
      .should(value => expect(Number(value)).gt(0).and.lt(Number(SWAP_TEST.balance)))
      .then(amount => {
        poolSwapSubmit().should('be.enabled')
        cy.then(() => scenario.assertPreSubmit({ amount }))
        submitPoolSwap(true).then(() => scenario.assertSubmit({ amount }))
      })
  })

  it('updates minimum received and transaction slippage through the settings modal', () => {
    const scenario = createSwapScenario()
    mountSwap(scenario)
    writePoolSwapAmount('pay', SWAP_TEST.input)
    poolSwapSubmit().should('be.enabled')
    cy.get('[data-testid="slippage-settings-button"]').click()
    cy.get('[data-testid="slippage-input"] input').clear().type(SWAP_TEST.customSlippage)
    cy.get('[data-testid="slippage-save-button"]').click()
    getActionValue('pool-minimum-received', 'mock.simulation').should(
      'equal',
      formatToken(SWAP_TEST.customMinimumReceived, 'DAI', 'balance'),
    )
    poolSwapSubmit().should('be.enabled')
    cy.then(() => scenario.assertPreSubmit({ slippage: SWAP_TEST.customSlippage }))
    submitPoolSwap(true).then(() => scenario.assertSubmit({ slippage: SWAP_TEST.customSlippage }))
  })

  it('blocks swaps with excessive price impact', () => {
    const scenario = createSwapScenario({ priceImpact: SWAP_TEST.blockedPriceImpact })
    mountSwap(scenario)
    writePoolSwapAmount('pay', SWAP_TEST.input)
    cy.get('[data-testid="high-price-impact-alert"]').should('be.visible')
    poolSwapSubmit().should('be.disabled')
    cy.then(() => expect(scenario.methods[0].swap.callCount).to.equal(0))
  })

  it('requires low-rate acknowledgement, supports cancellation and submits only after confirmation', () => {
    const scenario = createSwapScenario({ rate: SWAP_TEST.lowRate, approved: false })
    mountSwap(scenario)
    writePoolSwapAmount('pay', SWAP_TEST.input)
    cy.get('[data-testid="pool-swap-low-rate-alert"]').should('be.visible')
    poolSwapSubmit().click()
    cy.get('[data-testid="pool-swap-low-rate-modal"]').should('be.visible')
    cy.get('[data-testid="pool-swap-low-rate-confirm"]').should('be.disabled')
    cy.get('[data-testid="pool-swap-low-rate-checkbox"] input').check()
    cy.get('[data-testid="pool-swap-low-rate-confirm"]').should('be.enabled')
    cy.get('[data-testid="pool-swap-low-rate-modal"]').contains('button', 'Cancel').click()
    cy.then(() => {
      expect(scenario.methods[0].swap.callCount).to.equal(0)
      expect(scenario.methods[0].approve.callCount).to.equal(0)
    })
    poolSwapSubmit().click()
    cy.get('[data-testid="pool-swap-low-rate-confirm"]').should('be.disabled')
    cy.get('[data-testid="pool-swap-low-rate-checkbox"] input').check()
    submitAndExpectToast(
      () => cy.get('[data-testid="pool-swap-low-rate-confirm"]').click(),
      { message: 'Swap successful!', approvalMessage: 'Approved swap' },
      'mock.submit',
    ).then(() => scenario.assertSubmit())
    poolSwapAmount('pay').should('have.value', '')
    poolSwapSubmit().should('be.disabled')
  })

  it('allows a low nominal rate for a rate-bearing token without confirmation', () => {
    const scenario = createSwapScenario({
      rate: SWAP_TEST.lowRate,
      storedRates: ['1', SWAP_TEST.yieldBearingRate, '1'],
    })
    mountSwap(scenario)
    writePoolSwapAmount('pay', SWAP_TEST.input)
    poolSwapSubmit().should('be.enabled')
    cy.get('[data-testid="pool-swap-low-rate-alert"]').should('not.exist')
    submitPoolSwap(true).then(() => scenario.assertSubmit())
  })

  ;[false, true].forEach(connected => {
    it(`previews both sides while ${connected ? 'the wallet balance is zero' : 'disconnected'}`, () => {
      const scenario = createSwapScenario({ connected, balance: '0' })
      mountSwap(scenario)
      writePoolSwapAmount('pay', SWAP_TEST.input)
      poolSwapAmount('receive').should('have.attr', 'data-value', SWAP_TEST.output)
      writePoolSwapAmount('receive', SWAP_TEST.secondOutput)
      poolSwapAmount('pay').should('have.attr', 'data-value', SWAP_TEST.secondInput)
      getActionValue('pool-minimum-received', 'mock.simulation').should(
        'equal',
        formatToken(SWAP_TEST.secondMinimumReceived, 'DAI', 'balance'),
      )
      if (connected) poolSwapSubmit().should('be.disabled')
      else {
        cy.get('[data-testid="pool-swap-connect-wallet"]').should('be.visible')
        poolSwapSubmit().should('not.exist')
        cy.then(() => expect(getConnection(mockedWagmiConfig).status).to.equal('disconnected'))
      }
      cy.then(() => {
        expect(scenario.methods[0].swap.callCount).to.equal(0)
        expect(scenario.methods[0].approve.callCount).to.equal(0)
      })
    })
  })
})
