import { type Address } from 'viem'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneInt } from '@cy/support/generators'
import { TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { seedCrvUsdBalance } from '@cy/support/helpers/llamalend/query-cache.helpers'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import { resetLlamaTestContext, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createRepayScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = 1

describe('RepayForm (mocked)', () => {
  const createScenario = () => createRepayScenario({ chainId })

  afterEach(() => {
    resetLlamaTestContext()
  })

  it('fills and submits the repay form with randomized data', () => {
    const scenario = createScenario()
    const onRepaid = cy.spy().as('onRepaid')
    const { llamaApi, expected, market, borrow, stubs, collateral } = scenario

    void collateral
    setLlamaApi(llamaApi)
    seedCrvUsdBalance({
      chainId,
      addresses: [TEST_ADDRESS as Address, TEST_ADDRESS.toLowerCase() as Address],
      rawBalance: BigInt(oneInt(15, 80)) * 10n ** 18n,
    })

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi}>
        <RepayForm market={market} networks={networks} chainId={chainId} onRepaid={onRepaid} />
      </MockLoanTestWrapper>,
    )

    selectRepayToken({ symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, hasLeverage: false })
    writeRepayLoanForm({ amount: borrow })
    checkRepayDetailsLoaded({ debt: [scenario.currentDebt, scenario.futureDebt, 'crvUSD'], leverageEnabled: false })

    cy.then(() => {
      expect(stubs.parameters).to.have.been.calledWithExactly()
      expect(stubs.repayHealth).to.have.been.calledWithExactly(...expected.health)
      expect(stubs.repayPrices).to.have.been.calledWithExactly(...expected.prices)
      expect(stubs.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
      expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
    })

    submitRepayForm().then(() => {
      expect(stubs.repay).to.have.been.calledWithExactly(...expected.submit)
    })
  })
})
