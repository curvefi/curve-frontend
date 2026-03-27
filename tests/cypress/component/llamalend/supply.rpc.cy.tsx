import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  LlamalendSupplyTestCase,
  type LlamalendSupplyTestCaseProps,
} from '@cy/support/helpers/llamalend/LlamalendSupplyTestCase'
import { SUPPLY_TEST_MARKETS } from '@cy/support/helpers/llamalend/supply-rpc.helpers'
import { fundUserForSupplySetup } from '@cy/support/helpers/llamalend/supply-setup.helpers'
import {
  checkCurrentSuppliedAmount,
  checkDepositDetailsLoaded,
  checkWithdrawDetailsLoaded,
  expectSupplyCallbacks,
  selectMaxWithdraw,
  submitDepositForm,
  submitWithdrawForm,
  touchDepositForm,
  touchWithdrawForm,
  writeDepositForm,
  writeWithdrawForm,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'

SUPPLY_TEST_MARKETS.forEach(
  ({ id, label, chainId, borrowedTokenAddress, deposit, partialWithdraw, borrowedTokenDecimals }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `supply-integration-${uuid}`,
        display_name: `SupplyIntegration (${uuid})`,
        fork_config: { block_number: 'latest' },
      }))

      const suppliedAfterDeposit = deposit
      const suppliedAfterPartialWithdraw = new BigNumber(deposit).minus(partialWithdraw).toFixed() as Decimal

      let onSuccess: ReturnType<typeof cy.stub>

      const SupplyTestWrapper = ({ tab }: Pick<LlamalendSupplyTestCaseProps, 'tab'>) => (
        <LlamalendSupplyTestCase
          tab={tab}
          vnet={getVirtualNetwork()}
          privateKey={privateKey}
          chainId={chainId}
          marketId={id}
          userAddress={address}
          onSuccess={onSuccess}
        />
      )

      before(() => {
        fundUserForSupplySetup({
          vnet: getVirtualNetwork(),
          userAddress: address,
          borrowedTokenAddress,
          borrowedAmountWei: 10n ** BigInt(borrowedTokenDecimals + 3),
        })
        cy.log(`Funded some eth and crvUSD to ${address} in vnet ${getVirtualNetwork().slug}`)
      })

      beforeEach(() => {
        onSuccess = cy.stub().as('onSuccess')
      })

      it('deposits into the vault', () => {
        cy.mount(<SupplyTestWrapper />)
        writeDepositForm({ amount: deposit })
        checkDepositDetailsLoaded({ amountSupplied: deposit, prevAmountSupplied: '0' })
        submitDepositForm().then(() => expectSupplyCallbacks({ onSuccess }))
        touchDepositForm()
        checkCurrentSuppliedAmount(suppliedAfterDeposit)
      })

      it('partially withdraws from the vault', () => {
        cy.mount(<SupplyTestWrapper tab="withdraw" />)
        writeWithdrawForm({ amount: partialWithdraw })
        checkWithdrawDetailsLoaded({
          amountSupplied: suppliedAfterPartialWithdraw,
          prevAmountSupplied: suppliedAfterDeposit,
        })
        submitWithdrawForm().then(() => expectSupplyCallbacks({ onSuccess }))
        touchWithdrawForm()
        checkCurrentSuppliedAmount(suppliedAfterPartialWithdraw)
      })

      it('redeems the remaining vault balance', () => {
        cy.mount(<SupplyTestWrapper tab="withdraw" />)
        selectMaxWithdraw()
        checkWithdrawDetailsLoaded({
          amountSupplied: '0',
          prevAmountSupplied: suppliedAfterPartialWithdraw,
          expectedButtonText: 'Withdraw All',
        })
        submitWithdrawForm().then(() => expectSupplyCallbacks({ onSuccess }))
        touchWithdrawForm()
        checkCurrentSuppliedAmount('0')
      })
    })
  },
)
