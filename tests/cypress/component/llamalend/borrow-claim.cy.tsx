import { BorrowClaimForm } from '@/llamalend/features/borrow/components/BorrowClaimForm'
import {
  checkBorrowClaimDetailsLoaded,
  checkBorrowClaimTableState,
  createBorrowClaimScenario,
  submitBorrowClaim,
  validateBorrowClaimFormState,
} from '@cy/support/helpers/llamalend/borrow/claim.helpers'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  llamaNetworks,
  setupMockedLlamalendComponentTest,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { Chain } from '@primitives/network.utils'

const chainId = Chain.Ethereum
const testCases = [
  { title: 'no rewards', claimableCrv: '0' },
  { title: 'CRV rewards present', claimableCrv: '5.00' },
] as const

describe('BorrowClaimForm (mocked)', () => {
  beforeEach(setupMockedLlamalendComponentTest)

  testCases.forEach(({ title, claimableCrv }) => {
    it(`shows ${title} state`, () => {
      const { market, llamaApi, expected, assertPreSubmit, assertSubmit } = createBorrowClaimScenario({
        chainId,
        claimableCrv,
      })

      setLlamaApi(llamaApi)
      setGasInfo({ chainId })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
          <BorrowClaimForm networks={llamaNetworks} />
        </MockLoanTestWrapper>,
      )

      checkBorrowClaimTableState(expected.table)
      validateBorrowClaimFormState({ crvButtonDisabled: expected.crvButtonDisabled })

      checkBorrowClaimDetailsLoaded({ hasCrvRewards: expected.shouldClaimCrv })
      cy.then(assertPreSubmit)

      if (!expected.shouldClaimCrv) return

      submitBorrowClaim().then(assertSubmit)
    })
  })
})
