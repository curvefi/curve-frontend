/* eslint-disable @typescript-eslint/no-unused-expressions */
import { WithdrawForm } from '@/llamalend/features/supply/components/WithdrawForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  blurSupplyInput,
  checkSupplyActionInfoValues,
  submitWithdrawForm,
  writeSupplyInput,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createWithdrawScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum
const testCases = [
  { isFull: false, title: 'fills and submits partial withdraw', buttonText: 'Withdraw' },
  { isFull: true, title: 'fills and submits full withdraw', buttonText: 'Withdraw All' },
]

describe('WithdrawForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  testCases.forEach(({ isFull, title, buttonText }) => {
    it(title, () => {
      const { input, market, llamaApi, expected, stubs } = createWithdrawScenario({ chainId, isFull })
      const onSuccess = cy.spy().as('onSuccess')

      setLlamaApi(llamaApi)
      setGasInfo({ chainId, networks })

      cy.mount(
        <MockLoanTestWrapper llamaApi={llamaApi}>
          <WithdrawForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />
        </MockLoanTestWrapper>,
      )

      writeSupplyInput({ type: 'withdraw', amount: input.amount })
      blurSupplyInput('withdraw')
      checkSupplyActionInfoValues(expected.actionInfo)
      cy.get('[data-testid="supply-withdraw-submit-button"]').should('have.text', buttonText)

      cy.then(() => {
        expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
        expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
        expect(stubs.statsFutureRates).to.have.been.calledWithExactly(...expected.futureRates)
        expect(stubs.previewWithdraw).to.have.been.calledWithExactly(...expected.previewWithdraw)
      })

      submitWithdrawForm().then(() => {
        if (isFull) {
          expect(stubs.estimateGasRedeem).to.have.been.called
          expect(stubs.redeem).to.have.been.called
          expect(stubs.withdraw).to.not.have.been.called
        } else {
          expect(stubs.estimateGasWithdraw).to.have.been.calledWithExactly(...expected.estimateGas)
          expect(stubs.estimateGasRedeem).to.not.have.been.called
          expect(stubs.withdraw).to.have.been.calledWithExactly(...expected.submit)
          expect(stubs.redeem).to.not.have.been.called
        }
        expect(onSuccess).to.have.been.calledOnce
      })
    })
  })
})
