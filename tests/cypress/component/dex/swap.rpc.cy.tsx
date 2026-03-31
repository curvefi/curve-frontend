import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { checkSwapDetailsLoaded, submitApprovedSwap, writeSwapForm } from '@cy/support/helpers/swap/swap.helpers'
import { SwapTestCase } from '@cy/support/helpers/swap/SwapTestCase'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { Chain } from '@ui-kit/utils/network'

const FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH in wei

// ETH → USDT: native ETH requires no approval, simplifying the test
const FROM_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // ETH (native)
const TO_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT
const SWAP_AMOUNT = '0.1'

describe('Router Swap (RPC)', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `swap-integration-${uuid}`,
    display_name: `SwapIntegration (${uuid})`,
    fork_config: { block_number: 'latest' },
  }))

  beforeEach(() => {
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
