import { oneFloat, oneOf } from '@cy/support/generators'
import { clickTab } from '@cy/support/helpers/tabs'
import type { AppRoute } from '@cy/support/routes'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { SLIPPAGE, type SlippageType } from '@ui/features/forms/slippage/slippage.utils'

const TRICRYPTO_ADDRESS = '0x7f86bf177dd4f3494b841a37e810a34dd56c829b' as const

describe('Pool page', () => {
  const path: AppRoute = `dex/${oneOf(
    `ethereum/pools/${TRICRYPTO_ADDRESS}`,
    'ethereum/pools/0xa632d59b9b804a956bfaa9b48af3a1b74808fc1f',
    'arbitrum/pools/0x7f90122bf0700f9e7e1f688fe926940e8839f353',
    'robinhood/pools/0x1E8D78e9b3f0152D54d32904B7933f1cFE439Df1',
  )}`
  const slippageType: SlippageType = path.includes(TRICRYPTO_ADDRESS) ? 'crypto' : 'stable'
  const slippageConfig = SLIPPAGE[slippageType]
  const formatSlippage = (value: string) => `${Number(value).toFixed(2)}%`

  it('should update slippage settings', () => {
    cy.visitWithoutTestConnector(path)
    clickTab('tab', 'deposit', TIMEOUTS['ui.render'])
    cy.get('[data-testid="tab-deposit"]', TIMEOUTS['ui.render']).should('have.class', 'Mui-selected')
    cy.get('[data-testid="borrow-slippage-value"]').contains(formatSlippage(slippageConfig.default))
    cy.get('[data-testid="slippage-settings-button"]', TIMEOUTS['ui.interaction']).should('be.enabled').click()
    const [isPreset, value] = oneOf<[boolean, string]>(
      [true, oneOf(...slippageConfig.presets)],
      [false, oneFloat(Number(slippageConfig.min), Number(slippageConfig.max)).toFixed(2)],
    )
    if (isPreset) {
      cy.get(`[data-testid="slippage-radio-group"] [value="${value}"]`).click()
      cy.get('[data-testid="slippage-input"] input').should('have.value', '') // value is empty, placeholder shown
    } else {
      cy.get('[data-testid="slippage-input"] input').clear()
      cy.get('[data-testid="slippage-input"] input').type(value)
    }
    cy.get('[data-testid="slippage-save-button"]').click()
    cy.get('[data-testid="borrow-slippage-value"]').contains(formatSlippage(value))
  })
})
