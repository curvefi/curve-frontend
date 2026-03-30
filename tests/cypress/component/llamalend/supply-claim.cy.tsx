/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ClaimTab } from '@/llamalend/features/supply/components/ClaimTab'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneAddress } from '@cy/support/generators'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  checkClaimDetailsLoaded,
  checkClaimTableState,
  submitClaimForm,
} from '@cy/support/helpers/llamalend/supply/claim.helpers'
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createClaimScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum
const testCases = [
  { title: 'no rewards', claimableCrv: '0', claimableRewards: [] },
  { title: 'crv only', claimableCrv: '5.00', claimableRewards: [] },
  { title: 'rewards only', claimableCrv: '0', claimableRewards: [{ amount: '2.50', symbol: 'CVX' }] },
  {
    title: 'crv and rewards',
    claimableCrv: '5.00',
    claimableRewards: [{ amount: '2.50', symbol: 'CVX' }],
  },
]

describe('ClaimTab (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ title, claimableCrv, claimableRewards }) => {
    it(`shows ${title} state`, () => {
      const { market, llamaApi, expected, stubs } = createClaimScenario({
        chainId,
        claimableCrv,
        claimableRewards: claimableRewards.map((reward) => ({ ...reward, token: oneAddress() })),
      })

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <ClaimTab market={market} networks={networks} chainId={chainId} enabled />
        </MockLoanTestWrapper>,
      )

      checkClaimTableState({
        rows: expected.table.rows,
        totalNotional: expected.table.totalNotional,
        buttonDisabled: expected.buttonDisabled,
      })

      cy.then(() => {
        expect(stubs.claimableCrv).to.have.been.calledWithExactly(...expected.claimableCrv)
        expect(stubs.claimableRewards).to.have.been.calledWithExactly(...expected.claimableRewards)
        if (expected.shouldClaimCrv) {
          expect(stubs.estimateGasClaimCrv).to.have.been.calledWithExactly()
        } else {
          expect(stubs.estimateGasClaimCrv).to.not.have.been.called
        }
        if (expected.shouldClaimRewards) {
          expect(stubs.estimateGasClaimRewards).to.have.been.calledWithExactly()
        } else {
          expect(stubs.estimateGasClaimRewards).to.not.have.been.called
        }
      })

      if (expected.buttonDisabled) return

      checkClaimDetailsLoaded({ checkEstimatedTxCost: true })

      submitClaimForm().then(() => {
        if (expected.shouldClaimCrv) {
          expect(stubs.claimCrv).to.have.been.calledWithExactly()
        } else {
          expect(stubs.claimCrv).to.not.have.been.called
        }
        if (expected.shouldClaimRewards) {
          expect(stubs.claimRewards).to.have.been.calledWithExactly()
        } else {
          expect(stubs.claimRewards).to.not.have.been.called
        }
      })
    })
  })
})
