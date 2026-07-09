import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { oneBool } from '@cy/support/generators'
import { setupLlv2BorrowingLiquidity } from '@cy/support/helpers/llamalend/borrow-cap.helpers'
import {
  checkCollateralDetailsLoaded,
  checkCurrentCollateral,
  getCollateralInput,
  submitCollateralAddForm,
  submitCollateralRemoveForm,
  touchCollateralForm,
} from '@cy/support/helpers/llamalend/collateral.helpers'
import { oneLoanTestMarket } from '@cy/support/helpers/llamalend/create-loan.helpers'
import { LlammalendTestCase } from '@cy/support/helpers/llamalend/LlammalendTestCase'
import { setupTenderlyLoan } from '@cy/support/helpers/llamalend/loan-setup.helpers'
import { blockUnmockedApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { recordValues } from '@primitives/objects.utils'
import { LlamaMarketType } from '@ui-kit/types/market'

const testCases = recordValues(LlamaMarketType).map(type => oneLoanTestMarket(type))

describe('Collateral forms', () => {
  testCases.forEach(
    ({
      borrow,
      borrowedAddress,
      borrowedDecimals,
      chainId,
      collateral,
      collateralAddress,
      collateralDecimals,
      controllerAddress,
      id,
      label,
      marketType,
    }) =>
      describe(label, () => {
        skipTestsAfterFailure() // the remove collateral test needs the collateral to be added first

        const hasApi = oneBool() // tests must work with or without api access
        const privateKey = generatePrivateKey()
        const { address } = privateKeyToAccount(privateKey)
        const getVirtualNetwork = createVirtualTestnet(uuid => ({
          slug: `collateral-integration-${uuid}`,
          display_name: `CollateralIntegration (${uuid})`,
          chain_id: chainId,
          fork_config: { block_number: 'latest' },
        }))

        const addAmount = '0.01' as Decimal
        const removeAmount = '0.005' as Decimal
        const collateralAfterAdd: Decimal = `${+collateral + +addAmount}`
        const collateralAfterRemove: Decimal = `${+collateralAfterAdd - +removeAmount}`
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
            marketType={marketType}
          />
        )

        before(() => {
          const vnet = getVirtualNetwork()
          const { adminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)

          setupLlv2BorrowingLiquidity({
            adminRpcUrl,
            publicRpcUrl,
            chainId,
            controllerAddress,
            borrowedAddress,
            borrowedDecimals,
          })
          setupTenderlyLoan({
            vnet,
            userAddress: address,
            collateralAddress,
            controllerAddress,
            collateral,
            collateralDecimals,
            borrow,
            borrowedDecimals,
            range: 10n,
            collateralFundingMultiplier: 2n,
          })
        })

        beforeEach(() => {
          onPricesUpdated = cy.stub().as('onPricesUpdated')
          if (!hasApi) blockUnmockedApis()
        })

        it('adds collateral', () => {
          cy.mount(<CollateralTest tab="add-collateral" />)

          getCollateralInput('add-collateral-input').type(addAmount)
          checkCollateralDetailsLoaded({ current: collateral, future: collateralAfterAdd, hasApi })

          submitCollateralAddForm()
          touchCollateralForm('add-collateral-input')
          checkCurrentCollateral(collateralAfterAdd)
        })

        it('removes collateral', () => {
          cy.mount(<CollateralTest tab="remove-collateral" />)

          getCollateralInput('remove-collateral-input').type(removeAmount)
          checkCollateralDetailsLoaded({ current: collateralAfterAdd, future: collateralAfterRemove, hasApi })

          submitCollateralRemoveForm()
          touchCollateralForm('remove-collateral-input')
          checkCurrentCollateral(collateralAfterRemove)
        })
      }),
  )
})
