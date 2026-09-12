import { zeroAddress } from 'viem'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'

describe('Slippage settings', () => {
  it('does not submit an enclosing form when saving', () => {
    const onSubmit = cy.stub().as('onSubmit')

    cy.mount(
      <ComponentTestWrapper>
        <form
          onSubmit={event => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <SlippageToleranceActionInfo maxSlippage="0.5" type="leverage" userAddress={zeroAddress} />
        </form>
      </ComponentTestWrapper>,
    )

    cy.get('[data-testid="slippage-settings-button"]').click()
    cy.get(`[data-testid="slippage-radio-group"] [value="${SLIPPAGE.leverage.presets[1]}"]`).click()
    cy.get('[data-testid="slippage-save-button"]').click()
    cy.get('@onSubmit').should('not.have.been.called')
  })
})
