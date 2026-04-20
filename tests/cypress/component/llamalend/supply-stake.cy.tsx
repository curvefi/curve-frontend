/* eslint-disable @typescript-eslint/no-unused-expressions */
import { StakeForm } from '@/llamalend/features/supply/components/StakeForm'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  checkStakeSubmit,
  readStakeAvailableAmount,
  submitStakeForm,
  writeStakeForm,
} from '@cy/support/helpers/llamalend/supply/stake.helpers'
import { createStakeScenario } from '@cy/support/helpers/llamalend/supply/supply-test-scenarios.helpers'
import { checkSupplyActionInfoValues } from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum
const testCases: { approved: boolean; title: string; buttonText: string; hasGauge?: boolean }[] = [
  { approved: true, title: 'fills and submits (already approved)', buttonText: 'Stake' },
  { approved: false, title: 'fills, approves, and submits', buttonText: 'Approve & Stake' },
  { approved: true, title: 'fills and cannot submit (no gauge)', buttonText: '', hasGauge: false },
]

describe('StakeForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ approved, title, buttonText, hasGauge }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createStakeScenario({ chainId, approved, hasGauge })

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks: llamaNetworks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <StakeForm market={market} networks={llamaNetworks} chainId={chainId} enabled />
        </MockLoanTestWrapper>,
      )

      readStakeAvailableAmount()
      writeStakeForm({ amount: input.amount })
      checkStakeSubmit({ buttonText, hasGauge })
      // stop test if no gauge because no gas estimation and submit disabled
      if (!hasGauge) return
      checkSupplyActionInfoValues(expected.actionInfo)

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
        if (approved) {
          expect(stubs.stakeApprove).to.not.have.been.called
        } else {
          expect(stubs.stakeApprove).to.have.been.calledWithExactly(...expected.approve)
        }
      })
    })
  })
})
