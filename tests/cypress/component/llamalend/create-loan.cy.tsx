import { type Hex, zeroAddress } from 'viem'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/mocks/create-loan.mocks'
import {
  llamaNetworks,
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { holdMockedTransactionReceipt } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'

const CHAIN_ID = 1
const OVERSIZED_CALLDATA = `0x${'00'.repeat(9_401)}` as const
const DELEGATION_HASH: Hex = `0x${'1'.repeat(64)}`
const testCases = [
  { approved: false, title: 'fills, approves, and submits' },
  { approved: true, title: 'fills and submits' },
].flatMap(testCase => [
  { ...testCase, hasLeverage: false, leverageEnabled: false },
  { ...testCase, title: `${testCase.title} with leverage`, hasLeverage: true, leverageEnabled: true },
])

describe('CreateLoanForm (mocked)', () => {
  beforeEach(setupMockedLlamalendComponentTest)

  const setupDelegation = ({ routeCalldata, approved = false }: { routeCalldata?: Hex; approved?: boolean } = {}) => {
    const scenario = createCreateLoanScenario({
      chainId: CHAIN_ID,
      approved,
      leverage: true,
      controllerApproved: false,
      routeCalldata,
    })
    const { llamaApi, market, collateral, borrow } = scenario
    Object.assign(market, { version: 'v2' })
    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID })
    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <CreateLoanForm networks={llamaNetworks} onPricesUpdated={cy.spy()} />
      </MockLoanTestWrapper>,
    )
    writeCreateLoanForm({ collateral, borrow, leverageEnabled: true, hasLeverage: true, waitForRoutes: true })
    cy.get('[data-testid="loan-form-error-routeId"]').should('not.exist')
    cy.get('[data-testid="create-loan-submit-button"]')
      .should('be.enabled')
      .and('have.text', 'Approve & Borrow')
      .click()
    cy.get('[data-testid="leverage-delegation-modal"]').should('be.visible')
    return scenario
  }

  it('waits for delegation before token approval and LLv2 creation with oversized calldata', () => {
    const { controllerApproval, leverageStubs } = setupDelegation({ routeCalldata: OVERSIZED_CALLDATA })
    const delegate = controllerApproval.setControllerApproval as unknown as ReturnType<typeof cy.stub>
    const createLoan = leverageStubs.createLoan as unknown as ReturnType<typeof cy.stub>
    const tokenApprove = leverageStubs.createLoanApprove as unknown as ReturnType<typeof cy.stub>
    delegate.resolves([DELEGATION_HASH])
    const receipt = holdMockedTransactionReceipt(DELEGATION_HASH)
    cy.get('[data-testid="leverage-delegation-modal"]')
      .find('[data-testid="estimated-tx-cost-value"]')
      .should('be.visible')
      .and('have.attr', 'data-value')
      .and('not.be.empty')
    cy.get('[data-testid="leverage-delegation-modal"]')
      .contains('Token spending approval is a separate transaction.')
      .should('be.visible')
    cy.then(() => expect(createLoan.callCount).to.equal(0))
    cy.get('[data-testid="leverage-delegation-approve"]').click()
    cy.wrap(null).should(() => expect(receipt.wasRequested()).to.equal(true))
    cy.then(() => {
      expect(tokenApprove.callCount).to.equal(0)
      expect(createLoan.callCount).to.equal(0)
      receipt.release()
    })
    cy.contains('[data-testid="toast-success"]', 'Loan created', TRANSACTION_LOAD_TIMEOUT)
    cy.then(() => {
      expect(delegate.callCount).to.equal(1)
      expect(delegate.calledBefore(tokenApprove)).to.equal(true)
      expect(tokenApprove.calledBefore(createLoan)).to.equal(true)
      expect(createLoan.callCount).to.equal(1)
    })
  })

  it('stops before any transaction when delegation is dismissed', () => {
    const { controllerApproval, market } = setupDelegation({ approved: true })
    const tokenApprove = market.leverageZapV2.createLoanApprove as unknown as ReturnType<typeof cy.stub>
    const createLoan = market.leverageZapV2.createLoan as unknown as ReturnType<typeof cy.stub>
    cy.get('body').type('{esc}')
    cy.get('[data-testid="leverage-delegation-modal"]').should('not.exist')
    cy.get('[data-testid="leverage-checkbox"]').click()
    cy.get('[data-testid="create-loan-submit-button"]').should('have.text', 'Borrow')
    cy.then(() => {
      expect(controllerApproval.setControllerApproval.callCount).to.equal(0)
      expect(tokenApprove.callCount).to.equal(0)
      expect(createLoan.callCount).to.equal(0)
    })
  })

  it('reports a delegation failure without creating the loan', () => {
    const { controllerApproval, market } = setupDelegation()
    const tokenApprove = market.leverageZapV2.createLoanApprove as unknown as ReturnType<typeof cy.stub>
    const createLoan = market.leverageZapV2.createLoan as unknown as ReturnType<typeof cy.stub>
    const delegate = controllerApproval.setControllerApproval as unknown as ReturnType<typeof cy.stub>
    delegate.rejects(new Error('Delegation transaction rejected'))
    cy.get('[data-testid="leverage-delegation-approve"]').click()
    cy.get('[data-testid="loan-alert-error-message"]').contains('Delegation transaction rejected')
    cy.get('[data-testid="leverage-delegation-modal"]').should('not.exist')
    cy.then(() => {
      expect(controllerApproval.setControllerApproval.callCount).to.equal(1)
      expect(tokenApprove.callCount).to.equal(0)
      expect(createLoan.callCount).to.equal(0)
    })
  })

  testCases.forEach(({ approved, hasLeverage, leverageEnabled, title }) => {
    it(title, () => {
      const { llamaApi, market, borrow, collateral, assertPreSubmit, assertSubmit } = createCreateLoanScenario({
        chainId: CHAIN_ID,
        presetRange: 50,
        approved,
        leverage: hasLeverage,
      })
      const onPricesUpdated = cy.spy().as('onPricesUpdated')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId: CHAIN_ID })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
          <CreateLoanForm networks={llamaNetworks} onPricesUpdated={onPricesUpdated} />
        </MockLoanTestWrapper>,
      )

      writeCreateLoanForm({ collateral, borrow, leverageEnabled, hasLeverage, waitForRoutes: leverageEnabled })
      checkLoanDetailsLoaded({ leverageEnabled })

      cy.then(assertPreSubmit)
      submitCreateLoanForm().then(assertSubmit)
    })
  })

  it('hides leverage for an unlisted ZapV2 market', () => {
    const { llamaApi, market } = createCreateLoanScenario({
      chainId: CHAIN_ID,
      presetRange: 50,
      approved: true,
      leverage: true,
    })
    Object.assign((market as LendMarketTemplate).addresses, { controller: zeroAddress })
    setLlamaApi(llamaApi)
    setGasInfo({ chainId: CHAIN_ID })
    cy.intercept('GET', '**/api/router/v1/routes*').as('routerRoutes')

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <CreateLoanForm networks={llamaNetworks} onPricesUpdated={cy.spy()} />
      </MockLoanTestWrapper>,
    )

    cy.get('[data-testid="leverage-checkbox"]').should('not.exist')
    cy.get('@routerRoutes.all').should('have.length', 0)
  })
})
