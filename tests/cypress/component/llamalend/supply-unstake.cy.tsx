/* eslint-disable @typescript-eslint/no-unused-expressions */
import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import {
  blurSupplyInput,
  checkSupplyActionInfoValues,
  checkSupplyAlert,
  submitUnstakeForm,
  writeSupplyInput,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { resetLlamaTestContext, setGasInfo, setLlamaApi } from '@cy/support/helpers/llamalend/test-context.helpers'
import { createUnstakeScenario } from '@cy/support/helpers/llamalend/test-scenarios.helpers'
import { Chain } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const chainId = Chain.Ethereum

describe('UnstakeForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  it('fills and submits', () => {
    const { input, market, llamaApi, expected, stubs } = createUnstakeScenario({ chainId })
    const onSuccess = cy.spy().as('onSuccess')

    setLlamaApi(llamaApi)
    setGasInfo({ chainId, networks })

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi}>
        <UnstakeForm market={market} networks={networks} chainId={chainId} onSuccess={onSuccess} enabled />
      </MockLoanTestWrapper>,
    )

    checkSupplyAlert(expected.alert)
    writeSupplyInput({ type: 'unstake', amount: input.amount })
    blurSupplyInput('unstake')
    checkSupplyActionInfoValues(expected.actionInfo)
    cy.get('[data-testid="supply-unstake-submit-button"]').should('have.text', 'Unstake')

    cy.then(() => {
      expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
      expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
      expect(stubs.estimateGasUnstake).to.have.been.calledWithExactly(...expected.estimateGas)
    })

    submitUnstakeForm().then(() => {
      expect(stubs.unstake).to.have.been.calledWithExactly(...expected.submit)
      expect(onSuccess).to.have.been.calledOnce
    })
  })
})
