import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { createCreateLoanScenario } from '@cy/support/helpers/llamalend/create-loan-mocks'
import {
  checkLoanDetailsLoaded,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { createMockLlamaApi } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const onUpdate = async () => undefined

describe('CreateLoanForm (mocked)', () => {
  const onMutated = cy.spy().as('onMutated')
  const {
    market,
    form,
    stubs: {
      createLoan,
      createLoanBands,
      createLoanHealth,
      createLoanIsApproved,
      createLoanMaxRecv,
      createLoanPrices,
      estimateGasCreateLoan,
    },
    expected,
  } = createCreateLoanScenario()

  afterEach(() => {
    queryClient.clear()
    globalLibs.current = {} as never
    globalLibs.hydrated = {}
  })

  it('fills and submits the form with randomized rules', () => {
    const llamaApi = createMockLlamaApi(1, market)
    globalLibs.current.llamaApi = llamaApi as never

    cy.mount(
      <MockLoanTestWrapper chainId={1} mockMarket={market} llamaApi={llamaApi}>
        <CreateLoanForm market={market} networks={networks} chainId={1} onUpdate={onUpdate} onMutated={onMutated} />
      </MockLoanTestWrapper>,
    )

    writeCreateLoanForm(form)
    checkLoanDetailsLoaded({ leverageEnabled: false })

    cy.then(() => {
      ;[createLoanHealth, createLoanBands, createLoanPrices, estimateGasCreateLoan].forEach((stubFn) =>
        expect(stubFn).to.have.been.calledWith(...expected.queryDebtArgs),
      )
      expect(createLoanMaxRecv).to.have.been.calledWith(...expected.maxRecvArgs)
      expect(createLoanIsApproved).to.have.been.calledWith(...expected.approvedArgs)
    })

    submitCreateLoanForm().then(() => {
      expect(onMutated.callCount).to.eq(1)
      expect(createLoan).to.have.been.calledOnceWithExactly(...expected.submitArgs)
    })
  })
})
