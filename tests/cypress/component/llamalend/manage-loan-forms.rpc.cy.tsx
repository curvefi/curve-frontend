import React, { type ReactNode } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { BORROW_PRESET_RANGES } from '@/llamalend/constants'
import { AddCollateralForm } from '@/llamalend/features/manage-loan/components/AddCollateralForm'
import { RemoveCollateralForm } from '@/llamalend/features/manage-loan/components/RemoveCollateralForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import networks from '@/loan/networks'
import { oneBool, oneValueOf } from '@cy/support/generators'
import { LlamalendComponentWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { approveAndCreateLoan, TEST_LLAMA_MARKETS, useTestLlamaMarket } from '@cy/support/helpers/loan'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import Skeleton from '@mui/material/Skeleton'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum

const getVirtualNetwork = createVirtualTestnet((uuid) => ({
  slug: `manage-loan-forms-${uuid}`,
  display_name: `ManageLoanForms (${uuid})`,
  fork_config: { block_number: 'latest' },
}))

type Children = (market: LlamaMarketTemplate) => ReactNode

function ManageLoanFormTest({ type, children }: { type: LlamaMarketType; children: Children }) {
  const market = useTestLlamaMarket(type)
  return market ? children(market) : <Skeleton />
}

describe('Llamalend manage loan forms', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)

  const marketType = oneValueOf(LlamaMarketType)
  const { collateralAddress: collateralAddress } = TEST_LLAMA_MARKETS[marketType]

  before(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    fundEth({ adminRpcUrl, recipientAddresses: [address] })
    fundErc20({ adminRpcUrl, tokenAddress: collateralAddress, recipientAddresses: [address] })
  })

  it('should allow adding collateral to an existing loan', () => {
    cy.mount(
      <ManageLoanFormTestWrapper>
        {(market) => (
          <AddCollateralForm market={market} networks={networks} chainId={chainId} enabled onAdded={async () => {}} />
        )}
      </ManageLoanFormTestWrapper>,
    )

    cy.get('[data-testid="add-collateral-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')

    cy.get('[data-testid="add-collateral-input"] input[type="text"]').first().type('0.1')

    cy.get('[data-testid="add-collateral-submit-button"]').click()
    cy.get('[data-testid="add-collateral-submit-button"]').should('be.disabled')

    cy.get('[data-testid="loan-form-success-alert"]', LOAD_TIMEOUT).should('exist')
  })

  it('should allow repaying part of the loan from borrowed token', () => {
    cy.mount(
      <ManageLoanFormTestWrapper>
        {(market) => (
          <RepayForm market={market} networks={networks} chainId={chainId} enabled onRepaid={async () => {}} />
        )}
      </ManageLoanFormTestWrapper>,
    )

    cy.get('[data-testid="repay-user-borrowed-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')

    cy.get('[data-testid="repay-user-borrowed-input"] input[type="text"]').first().type('1')

    cy.get('[data-testid="repay-submit-button"]').click()
    cy.get('[data-testid="repay-submit-button"]').should('be.disabled')

    cy.get('[data-testid="loan-form-success-alert"]', LOAD_TIMEOUT).should('exist')
  })

  it('should allow removing a small amount of collateral', () => {
    cy.mount(
      <ManageLoanFormTestWrapper>
        {(market) => (
          <RemoveCollateralForm
            market={market}
            networks={networks}
            chainId={chainId}
            enabled
            onRemoved={async () => {}}
          />
        )}
      </ManageLoanFormTestWrapper>,
    )

    cy.get('[data-testid="remove-collateral-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')

    cy.get('[data-testid="remove-collateral-input"] input[type="text"]').first().type('0.01')

    cy.get('[data-testid="remove-collateral-submit-button"]').click()
    cy.get('[data-testid="remove-collateral-submit-button"]').should('be.disabled')

    cy.get('[data-testid="loan-form-success-alert"]', LOAD_TIMEOUT).should('exist')
  })
})

const ManageLoanFormTestWrapper = ({ children }: { children: Children }) => {
  const marketType = LlamaMarketType.Mint
  // const marketType = oneValueOf(LlamaMarketType)
  const { id: marketId } = TEST_LLAMA_MARKETS[marketType]
  return (
    <LlamalendComponentWrapper
      wagmi={{ vnet: getVirtualNetwork() }}
      network={networks[chainId]}
      onHydrated={async (lib) => {
        await approveAndCreateLoan(lib, {
          marketId,
          marketType,
          chainId,
          mutation: {
            userCollateral: '1',
            userBorrowed: '0',
            debt: '5',
            range: BORROW_PRESET_RANGES.Safe,
            slippage: '0.1',
            leverageEnabled: oneBool(),
          },
        })
      }}
    >
      <ManageLoanFormTest type={marketType}>{children}</ManageLoanFormTest>
    </LlamalendComponentWrapper>
  )
}
