import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import {
  checkCurrentCollateral,
  getCollateralInput,
  submitCollateralAddForm,
  submitCollateralRemoveForm,
  touchCollateralForm,
} from '@cy/support/helpers/llamalend/collateral.helpers'
import { oneLoanTestMarket } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { setupTenderlyLoan } from '@cy/support/helpers/llamalend/loan-setup.helpers'
import { LOAN_TEST_MARKETS } from '@cy/support/helpers/llamalend/test-markets'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { objectKeys } from '@primitives/objects.utils'
import { formatNumber } from '@ui-kit/utils'

// todo: test more markets
const _testCases = objectKeys(LOAN_TEST_MARKETS).map((type) => oneLoanTestMarket(type, (market) => !market.hasLeverage))
const testCases = [
  {
    ...LOAN_TEST_MARKETS.Mint[1],
    controllerAddress: '0xec0820efafc41d8943ee8de495fc9ba8495b15cf' as const,
    collateralDecimals: 18,
  },
]

describe('Collateral forms', () => {
  testCases.forEach(
    ({ borrow, chainId, collateral, collateralAddress, controllerAddress, collateralDecimals, id, label }) =>
      describe(label, () => {
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
        const collateralAfterAdd = `${+collateral + +addAmount}` as Decimal
        const collateralAfterRemove = `${+collateralAfterAdd - +removeAmount}` as Decimal
        let onPricesUpdated: ReturnType<typeof cy.stub>
        const CollateralTest = ({ tab }: { tab: 'add-collateral' | 'remove-collateral' }) => (
          <LlammalendTestCase
            type="loan"
            tab={tab}
            vnet={getVirtualNetwork()}
            privateKey={privateKey}
            chainId={chainId}
            marketId={id}
            userAddress={address}
            onPricesUpdated={onPricesUpdated}
          />
        )

        before(() =>
          setupTenderlyLoan({
            vnet: getVirtualNetwork(),
            userAddress: address,
            collateralAddress,
            controllerAddress,
            collateral,
            collateralDecimals,
            borrow,
          }),
        )

        beforeEach(() => {
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

          submitCollateralAddForm()
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

          submitCollateralRemoveForm()
          touchCollateralForm('remove-collateral-input')
          checkCurrentCollateral(collateralAfterRemove)
        })
      }),
  )
})
