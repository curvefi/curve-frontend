/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ClosePositionForm } from '@/llamalend/features/manage-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-liquidation/ui/tabs/ImproveHealthForm'
import { ResetPositionForm } from '@/llamalend/features/manage-liquidation/ui/tabs/ResetPositionForm'
import { oneInt } from '@cy/support/generators'
import { TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  createResetPositionScenario,
  createSoftLiquidationScenario,
} from '@cy/support/helpers/llamalend/mocks/soft-liquidation.mocks'
import { seedCrvUsdBalance } from '@cy/support/helpers/llamalend/query-cache.helpers'
import {
  checkRepayDetailsLoaded,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkClosePositionDetailsLoaded,
  checkResetPositionDetailsLoaded,
  checkResetPositionInputsLoaded,
  checkResetPositionMinimumWalletMessage,
  checkResetPositionWalletAmount,
  clickResetPositionMinimumWalletAmount,
  submitClosePositionForm,
  submitResetPositionForm,
  writeResetPositionWalletAmount,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import { constQ } from '@ui-kit/types/util'

const CHAIN_ID = 1
const testCases = [
  { approved: true, title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits' },
]

const mountResetPositionForm = ({
  llamaApi,
  market,
}: Pick<ReturnType<typeof createResetPositionScenario>, 'llamaApi' | 'market'>) => {
  setLlamaApi(llamaApi)
  setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
  cy.mount(
    <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
      <ResetPositionForm networks={llamaNetworks} />
    </MockLoanTestWrapper>,
  )
}

describe('Soft Liquidation Forms (mocked)', () => {
  beforeEach(resetLlamaTestContext)

  describe('ImproveHealthForm', () => {
    testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
      it(title, () => {
        const { borrow, debt, debtAfterImprove, expected, llamaApi, market, stubs } = createSoftLiquidationScenario({
          chainId: CHAIN_ID,
          approved,
        })

        setLlamaApi(llamaApi)
        setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
        seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: borrow })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
            <ImproveHealthForm networks={llamaNetworks} collateralEvents={constQ(undefined)} />
          </MockLoanTestWrapper>,
        )

        writeRepayLoanForm({ amount: borrow })
        checkRepayDetailsLoaded({
          debt: { current: debt, future: debtAfterImprove, symbol: 'crvUSD' },
          isPriceChanged: false,
        })
        cy.get('[data-testid="repay-submit-button"]').should('not.be.disabled')

        cy.wrap(stubs.repayHealth).should('have.been.calledWithExactly', ...expected.improveHealth.health)
        cy.then(() => {
          expect(stubs.parameters).to.have.been.calledWithExactly()
          expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.improveHealth.health)
          expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.improveHealth.prices)
          expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.improveHealth.isApproved)
          if (approved) {
            expect(stubs.estimateGasRepayApprove).to.not.have.been.called
            expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          } else {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(
              ...expected.improveHealth.estimateGasApprove,
            )
          }
        })

        submitRepayForm().then(() => {
          expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.improveHealth.estimateGas)
          if (approved) {
            expect(stubs.estimateGasRepayApprove).to.not.have.been.called
            expect(stubs.repayApprove).to.not.have.been.called
          } else {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(...expected.improveHealth.approve)
            expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.improveHealth.approve)
          }
          expect(stubs.repay).to.have.been.calledWithExactly(...expected.improveHealth.submit)
        })
      })
    })
  })

  describe('ClosePositionForm', () => {
    testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
      it(title, () => {
        const { debt, expected, llamaApi, market, stubs } = createSoftLiquidationScenario({
          chainId: CHAIN_ID,
          approved,
        })

        setLlamaApi(llamaApi)
        setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })
        seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: `${oneInt(15, 90)}` })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
            <ClosePositionForm networks={llamaNetworks} />
          </MockLoanTestWrapper>,
        )

        checkClosePositionDetailsLoaded({ debt })

        cy.then(() => {
          expect(stubs.selfLiquidateIsApproved).to.have.been.calledWithExactly(...expected.closePosition.isApproved)
        })

        submitClosePositionForm().then(() => {
          if (approved) {
            expect(stubs.estimateGasSelfLiquidateApprove).to.not.have.been.called
            expect(stubs.selfLiquidateApprove).to.not.have.been.called
          } else {
            expect(stubs.estimateGasSelfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.estimateGas)
            expect(stubs.selfLiquidateApprove).to.have.been.calledWithExactly(...expected.closePosition.approve)
          }
          expect(stubs.selfLiquidate).to.have.been.calledWithExactly(...expected.closePosition.submit)
        })
      })
    })
  })

  describe('ResetPositionForm', () => {
    testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
      it(title, () => {
        const { convertedBorrowed, debt, expected, futureDebt, llamaApi, market, stubs, userBorrowed } =
          createResetPositionScenario({ chainId: CHAIN_ID, approved })

        seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: userBorrowed })
        mountResetPositionForm({ llamaApi, market })

        checkResetPositionInputsLoaded({ convertedBorrowed })
        cy.get('[data-testid="reset-position-submit-button"]').should('be.disabled')

        clickResetPositionMinimumWalletAmount()
        checkResetPositionWalletAmount({ amount: userBorrowed })
        if (approved) {
          cy.wrap(stubs.estimateGasRepay).should('have.been.calledWithExactly', ...expected.estimateGas)
        } else {
          cy.wrap(stubs.estimateGasRepayApprove).should('have.been.calledWithExactly', ...expected.estimateGasApprove)
        }
        checkResetPositionDetailsLoaded({ debt: { current: debt, future: futureDebt, symbol: 'crvUSD' } })
        cy.get('[data-testid="reset-position-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled')

        cy.wrap(stubs.repayHealth).should('have.been.calledWithExactly', ...expected.health)
        cy.then(() => {
          expect(stubs.isRepayWithShrinkAvailable).to.have.been.calledWithExactly(...expected.isAvailable)
          expect(stubs.rates).to.have.been.calledWithExactly(...expected.rates)
          expect(stubs.futureRates).to.have.been.calledWithExactly(...expected.futureRates)
          expect(stubs.tokensToShrink).to.have.been.calledWithExactly(...expected.tokensToShrink)
          expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.health)
          expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.prices)
          expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        })

        submitResetPositionForm({ message: expected.successMessage }).then(() => {
          expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
          if (approved) {
            expect(stubs.estimateGasRepayApprove).to.not.have.been.called
            expect(stubs.repayApprove).to.not.have.been.called
          } else {
            expect(stubs.estimateGasRepayApprove).to.have.been.calledWithExactly(...expected.approve)
            expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.approve)
          }
          expect(stubs.repay).to.have.been.calledWithExactly(...expected.submit)
        })
      })
    })

    it('blocks reset when repay with shrink is not available', () => {
      const { convertedBorrowed, expected, llamaApi, market, stubs, userBorrowed } = createResetPositionScenario({
        chainId: CHAIN_ID,
        approved: true,
        isResetAvailable: false,
      })

      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: userBorrowed })
      mountResetPositionForm({ llamaApi, market })

      checkResetPositionInputsLoaded({ convertedBorrowed })
      writeResetPositionWalletAmount({ amount: userBorrowed })

      cy.get('[data-testid="loan-form-errors"]', LOAD_TIMEOUT)
        .should(
          'contain.text',
          'Reset is only available for soft-liquidation positions with enough non-converted bands',
        )
        .and('not.contain.text', 'Reset availability must be loaded')
        .and('not.contain.text', 'Minimum reset amount must be loaded')
      cy.get('[data-testid="reset-position-submit-button"]').should('be.disabled')

      cy.then(() => {
        expect(stubs.isRepayWithShrinkAvailable).to.have.been.calledWithExactly(...expected.isAvailable)
        expect(stubs.tokensToShrink).to.have.been.calledWithExactly(...expected.tokensToShrink)
        expect(stubs.repayHealth).to.not.have.been.called
        expect(stubs.repayPrices).to.not.have.been.called
        expect(stubs.repayIsApproved).to.not.have.been.called
        expect(stubs.estimateGasRepay).to.not.have.been.called
        expect(stubs.estimateGasRepayApprove).to.not.have.been.called
        expect(stubs.repay).to.not.have.been.called
      })
    })

    it('allows empty wallet amount when no wallet tokens are required', () => {
      const { convertedBorrowed, debt, getExpected, getFutureDebt, llamaApi, market, stubs } =
        createResetPositionScenario({ chainId: CHAIN_ID, approved: true, minBorrowed: '0' })
      const expected = getExpected('0')

      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: '0' })
      mountResetPositionForm({ llamaApi, market })

      checkResetPositionInputsLoaded({ convertedBorrowed })
      cy.wrap(stubs.estimateGasRepay).should('have.been.calledWithExactly', ...expected.estimateGas)
      checkResetPositionDetailsLoaded({
        debt: { current: debt, future: getFutureDebt('0'), symbol: 'crvUSD' },
      })
      cy.get('[data-testid="reset-position-submit-button"]', LOAD_TIMEOUT)
        .should('not.be.disabled')
        .and('contain.text', 'Reset position')
        .and('not.contain.text', 'Approve')

      cy.wrap(stubs.repayHealth).should('have.been.calledWithExactly', ...expected.health)
      cy.then(() => {
        expect(stubs.futureRates).to.have.been.calledWithExactly(...expected.futureRates)
        expect(stubs.tokensToShrink).to.have.been.calledWithExactly(...expected.tokensToShrink)
        expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.health)
        expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.prices)
        expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        expect(stubs.estimateGasRepayApprove).to.not.have.been.called
        expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
      })

      submitResetPositionForm({ message: expected.successMessage }).then(() => {
        expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        expect(stubs.estimateGasRepayApprove).to.not.have.been.called
        expect(stubs.repayApprove).to.not.have.been.called
        expect(stubs.repay).to.have.been.calledWithExactly(...expected.submit)
      })
    })

    it('requires the minimum wallet amount', () => {
      const { belowMinBorrowed, convertedBorrowed, llamaApi, market, minBorrowed } = createResetPositionScenario({
        chainId: CHAIN_ID,
        approved: true,
      })

      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: minBorrowed })
      mountResetPositionForm({ llamaApi, market })

      checkResetPositionInputsLoaded({ convertedBorrowed })
      checkResetPositionMinimumWalletMessage()
      writeResetPositionWalletAmount({ amount: belowMinBorrowed })

      cy.get('[data-testid="reset-position-input-user-borrowed"]')
        .should('contain.text', 'Add at least')
        .and('contain.text', 'from wallet to reset this position')
      cy.get('[data-testid="reset-position-submit-button"]').should('be.disabled')
    })

    it('allows more than the minimum wallet amount', () => {
      const { convertedBorrowed, debt, getExpected, getFutureDebt, llamaApi, market, moreUserBorrowed, stubs } =
        createResetPositionScenario({ chainId: CHAIN_ID, approved: true })
      const expected = getExpected(moreUserBorrowed)

      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: moreUserBorrowed })
      mountResetPositionForm({ llamaApi, market })

      checkResetPositionInputsLoaded({ convertedBorrowed })
      writeResetPositionWalletAmount({ amount: moreUserBorrowed })
      cy.wrap(stubs.estimateGasRepay).should('have.been.calledWithExactly', ...expected.estimateGas)
      checkResetPositionDetailsLoaded({
        debt: { current: debt, future: getFutureDebt(moreUserBorrowed), symbol: 'crvUSD' },
      })
      cy.get('[data-testid="reset-position-submit-button"]', LOAD_TIMEOUT).should('not.be.disabled')

      cy.wrap(stubs.repayHealth).should('have.been.calledWithExactly', ...expected.health)
      cy.then(() => {
        expect(stubs.futureRates).to.have.been.calledWithExactly(...expected.futureRates)
        expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.health)
        expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.prices)
        expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
      })

      submitResetPositionForm({ message: expected.successMessage }).then(() => {
        expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
        expect(stubs.repay).to.have.been.calledWithExactly(...expected.submit)
      })
    })

    it('requires the wallet amount to be within the user balance', () => {
      const { convertedBorrowed, llamaApi, market, moreUserBorrowed, userBorrowed } = createResetPositionScenario({
        chainId: CHAIN_ID,
        approved: true,
      })

      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: userBorrowed, max: userBorrowed })
      mountResetPositionForm({ llamaApi, market })

      checkResetPositionInputsLoaded({ convertedBorrowed })
      writeResetPositionWalletAmount({ amount: moreUserBorrowed })

      cy.get('[data-testid="reset-position-input-user-borrowed"]')
        .should('contain.text', 'The maximum reset amount is')
        .and('contain.text', '1k')
      cy.get('[data-testid="reset-position-submit-button"]').should('be.disabled')
    })

    it('blocks full repay through reset', () => {
      const { convertedBorrowed, fullRepayUserBorrowed, llamaApi, market } = createResetPositionScenario({
        chainId: CHAIN_ID,
        approved: true,
      })

      seedCrvUsdBalance({ chainId: CHAIN_ID, addresses: [TEST_ADDRESS], min: fullRepayUserBorrowed })
      mountResetPositionForm({ llamaApi, market })

      checkResetPositionInputsLoaded({ convertedBorrowed })
      writeResetPositionWalletAmount({ amount: fullRepayUserBorrowed })

      cy.get('[data-testid="reset-position-input-user-borrowed"]').should(
        'contain.text',
        'Use the close tab to fully repay and close this position',
      )
      cy.get('[data-testid="reset-position-submit-button"]').should('be.disabled')
    })
  })
})
