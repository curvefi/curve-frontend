/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Address } from 'viem'
import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { SOLVENCY_THRESHOLDS } from '@/llamalend/llama-markets.constants'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  checkDepositSubmit,
  checkMaxDeposit,
  submitDepositForm,
  writeDepositForm,
} from '@cy/support/helpers/llamalend/supply/deposit.helpers'
import { createDepositScenario } from '@cy/support/helpers/llamalend/supply/supply-test-scenarios.helpers'
import { checkSupplyActionInfoValues } from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum

const testCases: {
  title: string
  approved?: boolean
  buttonText?: string
  disabledMarketController?: Address
  maxDeposit?: Decimal
  solvencyPercent?: number
}[] = [
  { title: 'fills and submits (already approved)' },
  { approved: false, title: 'fills, approves, and submits', buttonText: 'Approve & Deposit' },
  { title: 'fills and submits after low solvency confirmation', solvencyPercent: 95 },
  { title: 'fills and cannot submit (very low solvency market)', solvencyPercent: 85 },
  { title: 'fills and cannot submit (max deposit limit)', maxDeposit: '5' },
  {
    title: 'fills and cannot submit (market alert)',
    disabledMarketController: '0xaD444663c6C92B497225c6cE65feE2E7F78BFb86',
  },
]

describe('DepositForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(
    ({
      approved = true,
      title,
      buttonText = 'Deposit',
      disabledMarketController,
      maxDeposit,
      solvencyPercent = 100,
    }) => {
      it(title, () => {
        const { input, market, llamaApi, expected, stubs } = createDepositScenario({
          chainId,
          approved,
          controller: disabledMarketController,
          maxDeposit,
          solvencyPercent,
        })

        setLlamaApi(llamaApi)
        setGasInfo({ chainId, networks: llamaNetworks })

        cy.mount(
          <MockLoanTestWrapper llamaApi={llamaApi}>
            <DepositForm market={market} networks={llamaNetworks} chainId={chainId} enabled />
          </MockLoanTestWrapper>,
        )

        writeDepositForm({ amount: input.amount })
        checkMaxDeposit(maxDeposit)
        checkDepositSubmit({ buttonText, withDisabledAlert: !!disabledMarketController, maxDeposit, solvencyPercent })
        // When `maxDeposit` is set, the entered amount exceeds the max, so the test stops after validating the disabled state.
        // This avoids adding custom expectations for action info values in this scenario.
        if (maxDeposit) return
        checkSupplyActionInfoValues(expected.actionInfo)

        cy.then(() => {
          expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
          expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
          expect(stubs.statsFutureRates).to.have.been.calledWithExactly(...expected.futureRates)
          expect(stubs.previewDeposit).to.have.been.calledWithExactly(...expected.previewDeposit)
          expect(stubs.depositIsApproved).to.have.been.calledWithExactly(...expected.isApproved)
          if (approved) {
            expect(stubs.estimateGasDeposit).to.have.been.calledWithExactly(...expected.estimateGas)
            expect(stubs.estimateGasDepositApprove).to.not.have.been.called
          } else {
            expect(stubs.estimateGasDepositApprove).to.have.been.calledWithExactly(...expected.estimateGasApprove)
          }
        })

        // A market alert or very low solvency blocks submission, so the test stops after validating the disabled state and action infos.
        if (disabledMarketController || solvencyPercent < SOLVENCY_THRESHOLDS.low) return

        submitDepositForm({ solvencyPercent }).then(() => {
          expect(stubs.deposit).to.have.been.calledWithExactly(...expected.submit)
          if (approved) {
            expect(stubs.depositApprove).to.not.have.been.called
          } else {
            expect(stubs.depositApprove).to.have.been.calledWithExactly(...expected.approve)
          }
        })
      })
    },
  )
})
