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
import { LOAN_TEST_MARKETS } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { setupTenderlyLoan } from '@cy/support/helpers/llamalend/loan-setup.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import type { Decimal } from '@primitives/decimal.utils'
import { recordValues } from '@primitives/objects.utils'
import { formatNumber } from '@ui-kit/utils'

describe('Collateral forms', () => {
  const testCases = recordValues(LOAN_TEST_MARKETS)
    .flat()
    .filter((market) => !market.hasLeverage) // todo: markets with leverage don't recognize the programmatic loan yet

  testCases.forEach(
    ({ borrow, chainId, collateral, collateralAddress, controllerAddress, collateralDecimals, id, label }) => {
      describe(label, () => {
        // skipTestsAfterFailure() // the remove collateral test needs the collateral to be added first

        const privateKey = generatePrivateKey()
        const { address } = privateKeyToAccount(privateKey)
        const getVirtualNetwork = createVirtualTestnet((uuid) => ({
          slug: `collateral-integration-${uuid}`,
          display_name: `CollateralIntegration (${uuid})`,
          fork_config: { block_number: 'latest' },
        }))

        const addAmount = '0.01' as Decimal
        const removeAmount = '0.005' as Decimal
        const collateralAfterAdd = `${+collateral + +addAmount}` as Decimal
        const collateralAfterRemove = `${+collateralAfterAdd - +removeAmount}` as Decimal
        let onSuccess: ReturnType<typeof cy.stub>
        let onPricesUpdated: ReturnType<typeof cy.stub>
        const CollateralTest = ({ tab }: { tab: 'add-collateral' | 'remove-collateral' }) => (
          <LlammalendTestCase
            tab={tab}
            vnet={getVirtualNetwork()}
            privateKey={privateKey}
            chainId={chainId}
            marketId={id}
            userAddress={address}
            onSuccess={onSuccess}
            onPricesUpdated={onPricesUpdated}
          />
        )

        before(() => {
          setupTenderlyLoan({
            vnet: getVirtualNetwork(),
            userAddress: address,
            collateralAddress: collateralAddress as Address,
            controllerAddress,
            collateral,
            collateralDecimals,
            borrow,
          })
        })

        beforeEach(() => {
          onSuccess = cy.stub().as('onSuccess')
          onPricesUpdated = cy.stub().as('onPricesUpdated')
        })

        it('adds collateral', () => {
          cy.mount(<CollateralTest tab="add-collateral" />)

          getCollateralInput('add-collateral-input').type(addAmount)
          getActionValue('borrow-collateral', 'previous').should(
            'equal',
            formatNumber(collateral, { abbreviate: false }),
          )
          getActionValue('borrow-collateral').should('equal', formatNumber(collateralAfterAdd, { abbreviate: false }))

          submitCollateralForm('add-collateral-submit-button', 'Collateral added').then(() => {
            expect(onSuccess).to.be.calledOnce
          })

          touchCollateralForm('add-collateral-input')
          checkCurrentCollateral(collateralAfterAdd)
        })

        it('removes collateral', () => {
          cy.mount(<CollateralTest tab="remove-collateral" />)

          getCollateralInput('remove-collateral-input').type(removeAmount)
          getActionValue('borrow-collateral', 'previous').should(
            'equal',
            formatNumber(collateralAfterAdd, { abbreviate: false }),
          )
          getActionValue('borrow-collateral').should(
            'equal',
            formatNumber(collateralAfterRemove, { abbreviate: false }),
          )

          submitCollateralForm('remove-collateral-submit-button', 'Collateral removed').then(() => {
            expect(onSuccess).to.be.calledOnce
          })

          touchCollateralForm('remove-collateral-input')
          checkCurrentCollateral(collateralAfterRemove)
        })
      })
    },
  )
})
