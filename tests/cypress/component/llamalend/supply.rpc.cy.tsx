import BigNumber from 'bignumber.js'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { LlamalendSupplyTestCase } from '@cy/support/helpers/llamalend/LlamalendSupplyTestCase'
import { SUPPLY_TEST_MARKETS } from '@cy/support/helpers/llamalend/supply-rpc.helpers'
import { fundUserForSupplySetup, setupTenderlySupplyDeposit } from '@cy/support/helpers/llamalend/supply-setup.helpers'
import {
  checkSupplyActionInfoValues,
  getSupplyInputBalanceValue,
  submitDepositForm,
  submitWithdrawForm,
  touchSupplyInput,
  writeSupplyInput,
} from '@cy/support/helpers/llamalend/supply.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@ui-kit/utils'

const expectBalanceDelta = ({
  balanceAfter,
  balanceBefore,
  delta,
  tolerance,
}: {
  balanceAfter: Decimal
  balanceBefore: Decimal
  delta: Decimal
  tolerance?: Decimal
}) => {
  const actualDelta = new BigNumber(balanceAfter).minus(balanceBefore)
  const expectedDelta = new BigNumber(delta)

  if (tolerance) {
    expect(actualDelta.minus(expectedDelta).abs().lte(tolerance)).to.equal(true)
    return
  }

  expect(actualDelta.toFixed()).to.equal(expectedDelta.toFixed())
}

SUPPLY_TEST_MARKETS.forEach(
  ({ id, label, chainId, borrowedTokenAddress, vaultAddress, deposit, partialWithdraw, borrowedTokenDecimals }) => {
    describe(label, () => {
      skipTestsAfterFailure()

      let privateKey = generatePrivateKey()
      let address = privateKeyToAccount(privateKey).address
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `supply-integration-${uuid}`,
        display_name: `SupplyIntegration (${uuid})`,
        fork_config: { block_number: 'latest' },
      }))

      const suppliedAfterDeposit = deposit
      const suppliedAfterPartialWithdraw = new BigNumber(deposit).minus(partialWithdraw).toFixed() as Decimal

      let onSuccess: ReturnType<typeof cy.stub>

      const mountSupplyTest = (tab: 'deposit' | 'withdraw') =>
        cy.mount(
          <LlamalendSupplyTestCase
            tab={tab}
            vnet={getVirtualNetwork()}
            privateKey={privateKey}
            chainId={chainId}
            marketId={id}
            userAddress={address}
            onSuccess={onSuccess}
          />,
        )

      beforeEach(() => {
        privateKey = generatePrivateKey()
        address = privateKeyToAccount(privateKey).address

        fundUserForSupplySetup({
          vnet: getVirtualNetwork(),
          userAddress: address,
          borrowedTokenAddress,
          borrowedAmountWei: 10n ** BigInt(borrowedTokenDecimals + 3),
        })
        cy.log(`Funded some eth and crvUSD to ${address} in vnet ${getVirtualNetwork().slug}`)
        onSuccess = cy.stub().as('onSuccess')
      })

      it('deposits into the vault', () => {
        let walletBalanceBefore: Decimal

        mountSupplyTest('deposit')

        getSupplyInputBalanceValue('deposit')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((balance) => {
            walletBalanceBefore = balance as Decimal
          })

        writeSupplyInput({ type: 'deposit', amount: deposit })
        checkSupplyActionInfoValues({
          amountSupplied: deposit,
          prevAmountSupplied: '0',
          symbol: 'crvUSD',
        })

        submitDepositForm().then(() => expect(onSuccess).to.be.calledOnce)

        getSupplyInputBalanceValue('deposit')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((walletBalanceAfter) => {
            expectBalanceDelta({
              balanceAfter: walletBalanceAfter as Decimal,
              balanceBefore: walletBalanceBefore,
              delta: new BigNumber(deposit).negated().toFixed() as Decimal,
            })
          })

        touchSupplyInput('deposit')
        getActionValue('supply-amount').should('equal', formatNumber(suppliedAfterDeposit, { abbreviate: false }))
        getActionValue('supply-amount', 'previous').should(
          'equal',
          formatNumber(suppliedAfterDeposit, { abbreviate: false }),
        )
      })

      it('partially withdraws from the vault', () => {
        let walletBalanceBefore: Decimal

        setupTenderlySupplyDeposit({
          vnet: getVirtualNetwork(),
          userAddress: address,
          borrowedTokenAddress,
          borrowedTokenDecimals,
          vaultAddress,
          deposit,
        })

        mountSupplyTest('deposit')
        getSupplyInputBalanceValue('deposit')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((balance) => {
            walletBalanceBefore = balance as Decimal
          })

        mountSupplyTest('withdraw')

        writeSupplyInput({ type: 'withdraw', amount: partialWithdraw })
        checkSupplyActionInfoValues({
          amountSupplied: suppliedAfterPartialWithdraw,
          prevAmountSupplied: suppliedAfterDeposit,
          symbol: 'crvUSD',
        })
        cy.get('[data-testid="supply-withdraw-submit-button"]').should('have.text', 'Withdraw')

        submitWithdrawForm().then(() => expect(onSuccess).to.be.calledOnce)

        getSupplyInputBalanceValue('withdraw')
          .invoke('attr', 'data-value')
          .should(
            'satisfy',
            (value?: string) =>
              value != null && Math.abs(Number(value) - Number(suppliedAfterPartialWithdraw)) < 0.0001,
          )

        touchSupplyInput('withdraw')
        getActionValue('supply-amount').should(
          'equal',
          formatNumber(suppliedAfterPartialWithdraw, { abbreviate: false }),
        )
        getActionValue('supply-amount', 'previous').should(
          'equal',
          formatNumber(suppliedAfterPartialWithdraw, { abbreviate: false }),
        )

        mountSupplyTest('deposit')
        getSupplyInputBalanceValue('deposit')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((walletBalanceAfter) => {
            expectBalanceDelta({
              balanceAfter: walletBalanceAfter as Decimal,
              balanceBefore: walletBalanceBefore,
              delta: partialWithdraw,
            })
          })
      })

      it('redeems the remaining vault balance', () => {
        let walletBalanceBefore: Decimal
        let redeemableBalance: Decimal

        setupTenderlySupplyDeposit({
          vnet: getVirtualNetwork(),
          userAddress: address,
          borrowedTokenAddress,
          borrowedTokenDecimals,
          vaultAddress,
          deposit: suppliedAfterPartialWithdraw,
        })

        mountSupplyTest('deposit')
        getSupplyInputBalanceValue('deposit')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((balance) => {
            walletBalanceBefore = balance as Decimal
          })

        mountSupplyTest('withdraw')
        getSupplyInputBalanceValue('withdraw')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((balance) => {
            redeemableBalance = balance as Decimal
          })

        cy.get('[data-testid="input-chip-Max"]', LOAD_TIMEOUT).click({ force: true })
        checkSupplyActionInfoValues({
          amountSupplied: '0',
          prevAmountSupplied: suppliedAfterPartialWithdraw,
          symbol: 'crvUSD',
        })
        cy.get('[data-testid="supply-withdraw-submit-button"]').should('have.text', 'Withdraw All')

        submitWithdrawForm().then(() => expect(onSuccess).to.be.calledOnce)

        getSupplyInputBalanceValue('withdraw')
          .invoke('attr', 'data-value')
          .should('satisfy', (value?: string) => value != null && Number(value) === 0)
        getSupplyInputBalanceValue('withdraw').should('have.text', formatNumber('0' as Decimal, { abbreviate: true }))

        touchSupplyInput('withdraw')
        getActionValue('supply-amount').should('equal', formatNumber('0' as Decimal, { abbreviate: false }))
        getActionValue('supply-amount', 'previous').should('equal', formatNumber('0' as Decimal, { abbreviate: false }))

        mountSupplyTest('deposit')
        getSupplyInputBalanceValue('deposit')
          .invoke('attr', 'data-value')
          .should('not.be.empty')
          .then((walletBalanceAfter) => {
            expectBalanceDelta({
              balanceAfter: walletBalanceAfter as Decimal,
              balanceBefore: walletBalanceBefore,
              delta: redeemableBalance,
              tolerance: '0.0001' as Decimal,
            })
          })
      })
    })
  },
)
