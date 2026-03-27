/* eslint-disable @typescript-eslint/no-unused-expressions */
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  blurSupplyInput,
  checkSupplyActionInfoValues,
  submitStakeForm,
  writeSupplyInput,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createStakeScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum
const testCases = [
  { approved: true, title: 'fills and submits (already approved)', buttonText: 'Stake' },
  { approved: false, title: 'fills, approves, and submits', buttonText: 'Approve & Stake' },
]

describe('StakeForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ approved, title, buttonText }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createStakeScenario({ chainId, approved })
      const onSuccess = cy.spy().as('onSuccess')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <StakeForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />
        </MockLoanTestWrapper>,
      )

      writeSupplyInput({ type: 'stake', amount: input.amount })
      blurSupplyInput('stake')
      checkSupplyActionInfoValues(expected.actionInfo)
      cy.get('[data-testid="supply-stake-submit-button"]').should('have.text', buttonText)

      cy.then(() => {
        expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
        expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
        expect(stubs.stakeIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
        if (approved) {
          expect(stubs.estimateGasStake).to.have.been.calledWithExactly(...expected.estimateGas)
        } else {
          expect(stubs.estimateGasStakeApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
        }
      })

      submitStakeForm().then(() => {
        expect(stubs.stake).to.have.been.calledWithExactly(...expected.submit)
        if (!approved) {
          expect(stubs.stakeApprove).to.have.been.calledWithExactly(...expected.approve)
        }
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
})
