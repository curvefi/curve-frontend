import { UnstakeForm } from '@/llamalend/features/supply/components/UnstakeForm'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createUnstakeScenario } from '@cy/support/helpers/llamalend/supply/supply-test-scenarios.helpers'
import {
  checkSupplyActionInfoValues,
  checkSupplyAlert,
  checkSupplySubmitButtonText,
} from '@cy/support/helpers/llamalend/supply/supply.helpers'
import {
  readUnstakeAvailableAssets,
  submitUnstakeForm,
  writeUnstakeForm,
} from '@cy/support/helpers/llamalend/supply/unstake.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum

describe('UnstakeForm (mocked)', () => {
  afterEach(() => resetLlamaTestContext())

  it('fills and submits', () => {
    const { input, market, llamaApi, expected, stubs } = createUnstakeScenario({ chainId })

    setLlamaApi(llamaApi)
    setGasInfo({ chainId, networks: llamaNetworks })

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <UnstakeForm networks={llamaNetworks} />
      </MockLoanTestWrapper>,
    )

    checkSupplyAlert(expected.alert)
    readUnstakeAvailableAssets()
    writeUnstakeForm({ assets: input.amount })
    checkSupplyActionInfoValues(expected.actionInfo)
    checkSupplySubmitButtonText('unstake', 'Unstake')

    cy.then(() => {
      expect(stubs.walletBalances).to.have.been.calledWithExactly(...expected.walletBalances)
      expect(stubs.statsRates).to.have.been.calledWithExactly(...expected.marketRates)
      expect(stubs.convertToShares).to.have.been.calledWithExactly(...expected.convertToShares)
      expect(stubs.estimateGasUnstake).to.have.been.calledWithExactly(...expected.estimateGas)
    })

    submitUnstakeForm().then(() => {
      expect(stubs.unstake).to.have.been.calledWithExactly(...expected.submit)
    })
  })
})
