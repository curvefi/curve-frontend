/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Address } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import {
  checkCurrentCollateral,
  getCollateralInput,
  submitCollateralForm,
  touchCollateralForm,
} from '@cy/support/helpers/llamalend/collateral.helpers'
import {
  getLoanTestMarketControllerAddress,
  oneLoanTestMarket,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { setupProgrammaticLoan } from '@cy/support/helpers/llamalend/loan-setup.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { formatNumber, type Decimal } from '@ui-kit/utils'

const market = oneLoanTestMarket()

describe(`${market.label} - collateral forms`, () => {
  skipTestsAfterFailure() // the remove collateral test needs the collateral to be added first

  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `collateral-integration-${uuid}`,
    display_name: `CollateralIntegration (${uuid})`,
    fork_config: { block_number: 'latest' },
  }))

  const addAmount = '0.01' as Decimal
  const removeAmount = '0.005' as Decimal
  const collateralAfterAdd = `${+market.collateral + +addAmount}` as Decimal
  const collateralAfterRemove = `${+collateralAfterAdd - +removeAmount}` as Decimal
  const controllerAddress = getLoanTestMarketControllerAddress(market) as Address
  let onSuccess: ReturnType<typeof cy.stub>
  let onPricesUpdated: ReturnType<typeof cy.stub>
  const CollateralTest = ({ tab }: { tab: 'add-collateral' | 'remove-collateral' }) => (
    <LlammalendTestCase
      tab={tab}
      vnet={getVirtualNetwork()}
      privateKey={privateKey}
      chainId={market.chainId}
      marketId={market.id}
      userAddress={address}
      onSuccess={onSuccess}
      onPricesUpdated={onPricesUpdated}
    />
  )

  before(() => {
    setupProgrammaticLoan({
      vnet: getVirtualNetwork(),
      userAddress: address,
      collateralAddress: market.collateralAddress as Address,
      controllerAddress,
      collateral: market.collateral,
      borrow: market.borrow,
    })
  })

  beforeEach(() => {
    onSuccess = cy.stub().as('onSuccess')
    onPricesUpdated = cy.stub().as('onPricesUpdated')
  })

  it('adds collateral without creating loan in UI', () => {
    cy.mount(<CollateralTest tab="add-collateral" />)

    getCollateralInput('add-collateral-input').type(addAmount)
    getActionValue('borrow-collateral', 'previous').should(
      'equal',
      formatNumber(market.collateral, { abbreviate: false }),
    )
    getActionValue('borrow-collateral').should('equal', formatNumber(collateralAfterAdd, { abbreviate: false }))

    submitCollateralForm('add-collateral-submit-button', 'Collateral added').then(() => {
      expect(onSuccess).to.be.calledOnce
    })

    touchCollateralForm('add-collateral-input')
    checkCurrentCollateral(collateralAfterAdd)
  })

  it('removes collateral without creating loan in UI', () => {
    cy.mount(<CollateralTest tab="remove-collateral" />)

    getCollateralInput('remove-collateral-input').type(removeAmount)
    getActionValue('borrow-collateral', 'previous').should(
      'equal',
      formatNumber(collateralAfterAdd, { abbreviate: false }),
    )
    getActionValue('borrow-collateral').should('equal', formatNumber(collateralAfterRemove, { abbreviate: false }))

    submitCollateralForm('remove-collateral-submit-button', 'Collateral removed').then(() => {
      expect(onSuccess).to.be.calledOnce
    })

    touchCollateralForm('remove-collateral-input')
    checkCurrentCollateral(collateralAfterRemove)
  })
})
