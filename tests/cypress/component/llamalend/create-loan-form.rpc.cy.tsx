import React from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnBorrowFormUpdate } from '@/llamalend/features/borrow/types'
import type { CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import networks from '@/loan/networks'
import { oneBool, oneValueOf } from '@cy/support/generators'
import { LlamalendComponentWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { checkAccordion, getActionValue, TEST_LLAMA_MARKETS, useTestLlamaMarket } from '@cy/support/helpers/loan'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import Skeleton from '@mui/material/Skeleton'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

const chainId = Chain.Ethereum
const onUpdate: OnBorrowFormUpdate = async (form) => console.info('form updated', form)

type BorrowTabTestProps = { type: LlamaMarketType } & Pick<CreateLoanOptions, 'onCreated'>

function BorrowTabTest({ type, onCreated }: BorrowTabTestProps) {
  const market = useTestLlamaMarket(type)
  return market ? (
    <CreateLoanForm market={market} networks={networks} chainId={chainId} onUpdate={onUpdate} onCreated={onCreated} />
  ) : (
    <Skeleton />
  )
}

describe('Create loan form component tests', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `borrow-tab-${uuid}`,
    display_name: `BorrowTab (${uuid})`,
    // calldata is created by Odos, which uses the real mainnet state. Fork isn't fully synced, but the chance of reverts is smaller this way
    fork_config: { block_number: 'latest' },
  }))

  const marketType = oneValueOf(LlamaMarketType)
  const { collateralAddress, collateral, borrow } = TEST_LLAMA_MARKETS[marketType]
  const leverageEnabled = oneBool() // test with and without leverage

  beforeEach(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    fundEth({ adminRpcUrl, recipientAddresses: [address] })
    fundErc20({ adminRpcUrl, tokenAddress: collateralAddress, recipientAddresses: [address] })
    cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
  })

  const BorrowTabTestWrapper = (props: BorrowTabTestProps) => (
    <LlamalendComponentWrapper wagmi={{ vnet: getVirtualNetwork(), privateKey }} network={networks[chainId]}>
      <BorrowTabTest {...props} />
    </LlamalendComponentWrapper>
  )

  it(`calculates max debt and health for ${marketType} market ${leverageEnabled ? 'with' : 'without'} leverage`, () => {
    const onCreated = cy.stub()
    cy.mount(<BorrowTabTestWrapper type={marketType} onCreated={onCreated} />)
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]', LOAD_TIMEOUT).should('exist')
    cy.get('[data-testid="borrow-collateral-input"] input[type="text"]').first().type(collateral)
    cy.get('[data-testid="borrow-debt-input"] [data-testid="balance-value"]').should('not.contain.text', '?')
    getActionValue('borrow-health').should('have.text', '∞')
    cy.get('[data-testid="borrow-debt-input"] input[type="text"]').first().type(borrow)
    getActionValue('borrow-health').should('not.contain.text', '∞')

    if (leverageEnabled) {
      cy.get('[data-testid="leverage-checkbox"]').click()
    }
    checkAccordion(leverageEnabled)

    cy.get('[data-testid="loan-form-errors"]').should('not.exist')
    cy.get('[data-testid="create-loan-submit-button"]').click()
    cy.get('[data-testid="create-loan-submit-button"]').should('be.disabled')
    cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT).should('be.enabled')
    cy.get('[data-testid="create-loan-submit-button"]').then(() => expect(onCreated).to.be.called)
  })
})
