import { getAddress } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { TokenMapper } from '@/dex/queries/tokens.query'
import { checkSwapDetailsLoaded, submitApprovedSwap, writeSwapForm } from '@cy/support/helpers/swap/swap.helpers'
import { SwapTestCase } from '@cy/support/helpers/swap/SwapTestCase'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { Chain } from '@primitives/network.utils'

const FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH in wei

// ETH → USDT: native ETH requires no approval, simplifying the test
const FROM_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // ETH (native)
const TO_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDT
const SWAP_AMOUNT = '0.1'

describe('Router Swap (RPC)', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `swap-integration-${uuid}`,
    display_name: `SwapIntegration (${uuid})`,
    fork_config: { block_number: 'latest' },
  }))

  beforeEach(() => {
    cy.intercept('GET', '**/api/router/v1/tokens?chainId=1', {
      body: {
        [getAddress(FROM_ADDRESS)]: { decimals: 18, symbol: 'ETH' },
        [getAddress(TO_ADDRESS)]: { decimals: 6, symbol: 'USDC' },
      } satisfies TokenMapper,
    })
    const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())
    fundEth({ adminRpcUrl, amountWei: FUND_AMOUNT, recipientAddresses: [address] })
  })

  const TestWrapper = () => (
    <SwapTestCase
      vnet={getVirtualNetwork()}
      privateKey={privateKey}
      chainId={Chain.Ethereum}
      fromAddress={FROM_ADDRESS}
      toAddress={TO_ADDRESS}
    />
  )

  it('swaps ETH for USDT', () => {
    cy.mount(<TestWrapper />)
    writeSwapForm({ amount: SWAP_AMOUNT })
    checkSwapDetailsLoaded()
    submitApprovedSwap()
  })
})
