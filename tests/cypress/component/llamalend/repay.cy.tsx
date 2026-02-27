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
const testCases = [
  { approved: true, title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits' },
]

describe('RepayForm (mocked)', () => {
  afterEach(() => {
    resetLlamaTestContext()
  })

  testCases.forEach(({ approved, title }: { approved: boolean; title: string }) => {
    it(title, () => {
      const scenario = createRepayScenario({ chainId, approved })
      const onSuccess = cy.spy().as('onSuccess')
      const onPricesUpdated = cy.spy().as('onPricesUpdated')
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
          <RepayForm
            market={market}
            networks={networks}
            chainId={chainId}
            onSuccess={onSuccess}
            onPricesUpdated={onPricesUpdated}
          />
        </MockLoanTestWrapper>,
      )

      selectRepayToken({ symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, hasLeverage: false })
      writeRepayLoanForm({ amount: borrow })
      checkRepayDetailsLoaded({
        debt: { current: scenario.currentDebt, future: scenario.futureDebt, symbol: 'crvUSD' },
        leverageEnabled: false,
      })

      cy.wrap(stubs).should((s) => {
        expect(s.parameters).to.have.been.calledWithExactly()
        expect(s.repayHealth).to.have.been.calledWithExactly(...expected.health)
        expect(s.repayPrices).to.have.been.calledWithExactly(...expected.prices)
        expect(s.repayIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        if ('estimateGasRepayApprove' in s) {
          expect(s.estimateGasRepayApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        } else {
          expect(s.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
        }
      })

      submitRepayForm().then(() => {
        expect(stubs.estimateGasRepay).to.have.been.calledWithExactly(...expected.estimateGas)
        if ('repayApprove' in stubs) {
          expect(stubs.repayApprove).to.have.been.calledWithExactly(...expected.approve)
        }
        expect(stubs.repay).to.have.been.calledWithExactly(...expected.submit)
      })
    })
  })
})
