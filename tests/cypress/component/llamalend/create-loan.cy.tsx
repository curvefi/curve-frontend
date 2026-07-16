import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/mocks/create-loan.mocks'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'

const CHAIN_ID = 1
const testCases = [
  { approved: false, title: 'fills, approves, and submits' },
  { approved: true, title: 'fills and submits' },
].flatMap(testCase => [
  {
    ...testCase,
    hasLeverage: false,
    leverageEnabled: false,
  },
  {
    ...testCase,
    title: `${testCase.title} with leverage`,
    hasLeverage: true,
    leverageEnabled: true,
  },
])

describe('CreateLoanForm (mocked)', () => {
  beforeEach(resetLlamaTestContext)

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
      setGasInfo({ chainId: CHAIN_ID, networks: llamaNetworks })

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
})
